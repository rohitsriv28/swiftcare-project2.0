import { beforeEach, describe, expect, jest, test } from "@jest/globals";

const doctorModelMock = {
  find: jest.fn(),
  findById: jest.fn(),
  findOne: jest.fn(),
  findByIdAndUpdate: jest.fn(),
};

const appointmentModelMock = {
  find: jest.fn(),
};

jest.unstable_mockModule("../models/doctorModel.js", () => ({
  default: doctorModelMock,
}));

jest.unstable_mockModule("../models/appointmentModel.js", () => ({
  default: appointmentModelMock,
}));

// Mock bcrypt and jsonwebtoken
jest.unstable_mockModule("bcrypt", () => ({
  default: {
    compare: jest.fn(),
  },
}));
jest.unstable_mockModule("jsonwebtoken", () => ({
  default: {
    sign: jest.fn(),
  },
}));

const bcrypt = (await import("bcrypt")).default;
const jwt = (await import("jsonwebtoken")).default;

const {
  doctorList,
  doctorLogin,
  doctorAppointments,
  changeAvailability,
  doctorProfile,
  updateDoctorProfile,
} = await import("../controllers/doctorController.js");

describe("Doctor Controller Tests", () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockReq = {
      body: {},
      query: {},
      params: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  test("Should login doctor successfully with valid credentials", async () => {
    mockReq.body = { email: "doc@example.com", password: "password123" };
    doctorModelMock.findOne.mockResolvedValue({
      _id: "doc123",
      email: "doc@example.com",
      password: "hashedpassword",
      name: "Dr. Jane",
    });
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue("doctor-jwt-token");

    await doctorLogin(mockReq, mockRes);

    expect(doctorModelMock.findOne).toHaveBeenCalledWith({
      email: "doc@example.com",
    });
    expect(bcrypt.compare).toHaveBeenCalledWith(
      "password123",
      "hashedpassword",
    );
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        token: "doctor-jwt-token",
        doctor: expect.objectContaining({ id: "doc123" }),
      }),
    );
  });

  test("Should fail doctor login with invalid credentials", async () => {
    mockReq.body = { email: "doc@example.com", password: "wrong" };
    doctorModelMock.findOne.mockResolvedValue({
      _id: "doc123",
      email: "doc@example.com",
      password: "hashedpassword",
    });
    bcrypt.compare.mockResolvedValue(false);

    await doctorLogin(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid credentials",
    });
  });

  test("Should fetch doctor appointments list", async () => {
    mockReq.body = { docId: "doc123" };
    appointmentModelMock.find.mockResolvedValue([
      { _id: "app1", slotDate: "10_10_2026", slotTime: "10:00 AM" },
    ]);

    await doctorAppointments(mockReq, mockRes);

    expect(appointmentModelMock.find).toHaveBeenCalledWith({ docId: "doc123" });
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        appointments: expect.any(Array),
      }),
    );
  });

  test("Should toggle doctor availability state", async () => {
    mockReq.body = { docId: "doc123" };
    doctorModelMock.findById.mockResolvedValue({
      _id: "doc123",
      availability: true,
    });
    doctorModelMock.findByIdAndUpdate.mockResolvedValue(true);

    await changeAvailability(mockReq, mockRes);

    expect(doctorModelMock.findById).toHaveBeenCalledWith("doc123");
    expect(doctorModelMock.findByIdAndUpdate).toHaveBeenCalledWith("doc123", {
      availability: false,
    });
    expect(mockRes.json).toHaveBeenCalledWith({
      success: true,
      message: "Availability changed successfully",
    });
  });

  test("Should retrieve doctor profile info", async () => {
    mockReq.docId = "doc123";
    doctorModelMock.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({ _id: "doc123", name: "Dr. Jane" }),
    });

    await doctorProfile(mockReq, mockRes);

    expect(doctorModelMock.findById).toHaveBeenCalledWith("doc123");
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        profileData: expect.any(Object),
      }),
    );
  });

  test("Should update doctor profile info successfully", async () => {
    mockReq.docId = "doc123";
    mockReq.body = {
      fee: 450,
      address: { line1: "Street 1", line2: "Street 2" },
      availability: true,
      about: "Experienced psychiatrist",
    };
    doctorModelMock.findByIdAndUpdate.mockResolvedValue({ _id: "doc123" });

    await updateDoctorProfile(mockReq, mockRes);

    expect(doctorModelMock.findByIdAndUpdate).toHaveBeenCalledWith(
      "doc123",
      expect.objectContaining({
        fee: 450,
        availability: true,
      }),
    );
    expect(mockRes.json).toHaveBeenCalledWith({
      success: true,
      message: "Profile updated successfully",
    });
  });
});
