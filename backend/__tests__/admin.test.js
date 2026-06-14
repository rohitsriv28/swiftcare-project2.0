import { beforeEach, describe, expect, jest, test } from "@jest/globals";

const doctorModelMock = jest.fn().mockImplementation((data) => {
  return {
    ...data,
    save: jest.fn().mockResolvedValue(true),
  };
});
doctorModelMock.find = jest.fn().mockResolvedValue([]);
doctorModelMock.findOne = jest.fn();
doctorModelMock.findById = jest.fn();
doctorModelMock.countDocuments = jest.fn();
doctorModelMock.findByIdAndUpdate = jest.fn();

const appointmentModelMock = {
  find: jest.fn(),
  findById: jest.fn(),
  countDocuments: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  aggregate: jest.fn(),
};

const userModelMock = {
  countDocuments: jest.fn(),
};

jest.unstable_mockModule("../models/doctorModel.js", () => ({
  default: doctorModelMock,
}));

jest.unstable_mockModule("../models/appointmentModel.js", () => ({
  default: appointmentModelMock,
}));

jest.unstable_mockModule("../models/userModel.js", () => ({
  default: userModelMock,
}));

// Mock bcrypt and jsonwebtoken
jest.unstable_mockModule("bcrypt", () => ({
  default: {
    compare: jest.fn(),
    genSalt: jest.fn().mockResolvedValue("salt"),
    hash: jest.fn().mockResolvedValue("hashedpassword"),
  },
}));
jest.unstable_mockModule("jsonwebtoken", () => ({
  default: {
    sign: jest.fn(),
  },
}));

// Mock cloudinary stream upload
jest.unstable_mockModule("cloudinary", () => ({
  v2: {
    uploader: {
      upload_stream: jest.fn((options, callback) => {
        // Return a mock stream with .end()
        return {
          end: () => callback(null, { secure_url: "mock-cloudinary-url" }),
        };
      }),
    },
  },
}));

const bcrypt = (await import("bcrypt")).default;
const jwt = (await import("jsonwebtoken")).default;

const {
  addDoctor,
  adminLogin,
  allDoctors,
  allAppointments,
  appointmentCancellationByAdmin,
  adminDashboarddata,
  getDoctorPerformance,
  getAllDoctorPerformance,
  getCancellationRisk,
} = await import("../controllers/adminController.js");

describe("Admin Controller Tests", () => {
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
    process.env.ADMIN_EMAIL = "admin@swiftcare.com";
    process.env.ADMIN_PASSWORD_HASH = "hashed_admin_password";
    jest.clearAllMocks();
  });

  test("Should login admin with correct credentials", async () => {
    mockReq.body = { email: "admin@swiftcare.com", password: "password123" };
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue("admin-jwt-token");

    await adminLogin(mockReq, mockRes);

    expect(bcrypt.compare).toHaveBeenCalledWith(
      "password123",
      "hashed_admin_password",
    );
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        token: "admin-jwt-token",
      }),
    );
  });

  test("Should fail admin login with incorrect credentials", async () => {
    mockReq.body = { email: "admin@swiftcare.com", password: "wrong" };
    bcrypt.compare.mockResolvedValue(false);

    await adminLogin(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid email or password",
    });
  });

  test("Should add new doctor when credentials are valid", async () => {
    mockReq.body = {
      name: "Dr. Gregory House",
      email: "house@princeton.com",
      password: "password123",
      speciality: "Diagnostic Medicine",
      experience: "15 Years",
      degree: "MD",
      about: "Brilliant diagnostician",
      fee: "500",
      address: JSON.stringify({ line1: "123 Clinic Rd", line2: "Apt 2" }),
    };
    mockReq.file = {
      mimetype: "image/jpeg",
      size: 1000,
      buffer: Buffer.from("image"),
    };

    doctorModelMock.findOne.mockResolvedValue(null);
    doctorModelMock.prototype = {
      save: jest.fn().mockResolvedValue(true),
    };

    await addDoctor(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: true,
      message: "Doctor added successfully",
    });
  });

  test("Should return all appointments with pagination details", async () => {
    mockReq.query = { page: "2", limit: "5" };
    appointmentModelMock.countDocuments.mockResolvedValue(12);
    appointmentModelMock.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest
        .fn()
        .mockResolvedValue([{ _id: "app1", docId: "doc1", amount: 200 }]),
    });

    await allAppointments(mockReq, mockRes);

    expect(appointmentModelMock.countDocuments).toHaveBeenCalled();
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        appointments: expect.any(Array),
        pagination: expect.objectContaining({
          total: 12,
          page: 2,
          totalPages: 3,
        }),
      }),
    );
  });

  test("Should cancel appointment as admin and release slots", async () => {
    mockReq.body = { appointmentId: "app123" };
    appointmentModelMock.findById.mockResolvedValue({
      _id: "app123",
      docId: "doc1",
      slotDate: "20_06_2026",
      slotTime: "11:00 AM",
      isCancelled: false,
    });
    appointmentModelMock.findByIdAndUpdate.mockResolvedValue(true);
    doctorModelMock.findByIdAndUpdate.mockResolvedValue(true);

    await appointmentCancellationByAdmin(mockReq, mockRes);

    expect(appointmentModelMock.findByIdAndUpdate).toHaveBeenCalledWith(
      "app123",
      { isCancelled: true },
    );
    expect(doctorModelMock.findByIdAndUpdate).toHaveBeenCalledWith("doc1", {
      $pull: { "slots_booked.20_06_2026": "11:00 AM" },
    });
    expect(mockRes.json).toHaveBeenCalledWith({
      success: true,
      message: "Appointment cancelled successfully",
    });
  });

  test("Should retrieve system-wide counts and aggregates for admin dashboard", async () => {
    doctorModelMock.countDocuments.mockResolvedValue(5);
    appointmentModelMock.countDocuments.mockResolvedValue(15);
    userModelMock.countDocuments.mockResolvedValue(10);
    appointmentModelMock.aggregate.mockResolvedValue([
      { _id: null, total: 5000 },
    ]);
    appointmentModelMock.find.mockImplementation((query) => {
      if (query && query.date) {
        return Promise.resolve([]);
      }
      return {
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      };
    });

    await adminDashboarddata(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        dashboardData: expect.objectContaining({
          stats: expect.objectContaining({
            totalDoctors: 5,
            totalAppointments: 15,
            totalRevenue: 5000,
          }),
        }),
      }),
    );
  });
});
