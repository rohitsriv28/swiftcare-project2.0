import { beforeEach, describe, expect, jest, test } from "@jest/globals";

const doctorModel = {
  findById: jest.fn(),
  findOneAndUpdate: jest.fn(),
  findByIdAndUpdate: jest.fn(),
};
const userModel = {
  findById: jest.fn(),
};
const appointmentModel = jest.fn();

jest.unstable_mockModule("../models/doctorModel.js", () => ({
  default: doctorModel,
}));
jest.unstable_mockModule("../models/userModel.js", () => ({
  default: userModel,
}));
jest.unstable_mockModule("../models/appointmentModel.js", () => ({
  default: appointmentModel,
}));

const { bookAppointment } = await import("../controllers/userController.js");

describe("Booking Logic Tests (Race Conditions)", () => {
  let mockReq;
  let mockRes;
  let futureSlotDate;

  beforeEach(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    futureSlotDate = `${tomorrow.getDate()}_${tomorrow.getMonth() + 1}_${tomorrow.getFullYear()}`;

    mockReq = {
      body: {
        userId: "user123",
        docId: "doc123",
        slotDate: futureSlotDate,
        slotTime: "10:00 AM",
      },
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  test("Should fail gracefully preventing double-booking if atomicity $push constraint fails", async () => {
    doctorModel.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: "doc123",
        availability: true,
        fee: 50,
        slots_booked: {},
      }),
    });

    doctorModel.findOneAndUpdate.mockResolvedValue(null);

    await bookAppointment(mockReq, mockRes);

    expect(doctorModel.findOneAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        _id: "doc123",
        [`slots_booked.${futureSlotDate}`]: { $ne: "10:00 AM" },
      }),
      expect.objectContaining({
        $push: { [`slots_booked.${futureSlotDate}`]: "10:00 AM" },
      }),
      { new: true }
    );

    expect(mockRes.status).toHaveBeenCalledWith(409);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: "Slot is no longer available!",
    });
  });

  test("Should execute booking sequentially pushing documents accurately upon valid atomic insertion", async () => {
    doctorModel.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: "doc123",
        availability: true,
        fee: 50,
        slots_booked: {},
      }),
    });

    doctorModel.findOneAndUpdate.mockResolvedValue({ _id: "doc123" });

    userModel.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({ _id: "user123" }),
    });

    const saveMock = jest.fn().mockResolvedValue(true);
    appointmentModel.mockImplementation(() => ({
      save: saveMock,
    }));

    await bookAppointment(mockReq, mockRes);

    expect(saveMock).toHaveBeenCalled();
    expect(mockRes.json).toHaveBeenCalledWith({
      success: true,
      message: "Appointment Booked Successfully",
    });
  });
});
