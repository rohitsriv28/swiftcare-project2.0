import { bookAppointment } from "../controllers/userController.js";
import doctorModel from "../models/doctorModel.js";
import userModel from "../models/userModel.js";
import appointmentModel from "../models/appointmentModel.js";

jest.mock("../models/doctorModel.js");
jest.mock("../models/userModel.js");
jest.mock("../models/appointmentModel.js");

describe("Booking Logic Tests (Race Conditions)", () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockReq = {
      body: {
        userId: "user123",
        docId: "doc123",
        slotDate: "15_10_2024",
        slotTime: "10:00 AM"
      }
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  test("Should fail gracefully preventing double-booking if atomicity $push constraint fails", async () => {
    // Mock the doctor exists and is available
    doctorModel.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: "doc123",
        availability: true,
        fee: 50,
        slots_booked: {}
      })
    });

    // CRITICAL RACE CONDITION FIX TEST
    // Mongoose findOneAndUpdate returns null when the $ne condition fails
    // meaning the slot was already taken by a parallel process immediately before this execution
    doctorModel.findOneAndUpdate.mockResolvedValue(null);

    await bookAppointment(mockReq, mockRes);

    expect(doctorModel.findOneAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        _id: "doc123",
        "slots_booked.15_10_2024": { $ne: "10:00 AM" }
      }),
      expect.objectContaining({
        $push: { "slots_booked.15_10_2024": "10:00 AM" }
      }),
      { new: true }
    );

    // It should hit validation logic exactly mapped to null responses instead of crashing
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: "Slot is no longer available!"
    });
  });

  test("Should execute booking sequentially pushing documents accurately upon valid atomic insertion", async () => {
    // Setup initial valid conditions
    doctorModel.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({ _id: "doc123", availability: true, fee: 50, slots_booked: {} })
    });
    
    // Simulate successful atomic insertion
    doctorModel.findOneAndUpdate.mockResolvedValue({ _id: "doc123" });
    
    userModel.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({ _id: "user123" })
    });

    // Mock successful saving
    const saveMock = jest.fn().mockResolvedValue(true);
    appointmentModel.mockImplementation(() => ({
      save: saveMock
    }));

    await bookAppointment(mockReq, mockRes);

    // Assert saving occurred
    expect(saveMock).toHaveBeenCalled();
    expect(mockRes.json).toHaveBeenCalledWith({
      success: true,
      message: "Appointment Booked Successfully"
    });
  });
});
