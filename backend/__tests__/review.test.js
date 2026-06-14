import { beforeEach, describe, expect, jest, test } from "@jest/globals";

const reviewModelMock = jest.fn().mockImplementation((data) => {
  return {
    ...data,
    save: (...args) => reviewModelMock.prototype.save(...args),
  };
});
reviewModelMock.prototype = {
  save: jest.fn(),
};
reviewModelMock.findOne = jest.fn();
reviewModelMock.find = jest.fn();

const appointmentModelMock = {
  findById: jest.fn(),
};

const doctorModelMock = {
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
};

jest.unstable_mockModule("../models/reviewModel.js", () => ({
  default: reviewModelMock,
}));

jest.unstable_mockModule("../models/appointmentModel.js", () => ({
  default: appointmentModelMock,
}));

jest.unstable_mockModule("../models/doctorModel.js", () => ({
  default: doctorModelMock,
}));

const { addReview, getDoctorReviews } =
  await import("../controllers/userController.js");

describe("Review and Feedback Controller Tests", () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockReq = {
      body: {},
      params: {},
      query: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  test("Should fail if review rating is not between 1 and 5", async () => {
    mockReq.body = {
      userId: "user123",
      appointmentId: "app123",
      rating: 6,
      comment: "Awesome!",
    };

    await addReview(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: "Rating must be between 1 and 5",
    });
  });

  test("Should fail review if appointment is not found", async () => {
    mockReq.body = {
      userId: "user123",
      appointmentId: "app123",
      rating: 5,
      comment: "Awesome!",
    };
    appointmentModelMock.findById.mockResolvedValue(null);

    await addReview(mockReq, mockRes);

    expect(appointmentModelMock.findById).toHaveBeenCalledWith("app123");
    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: "Appointment not found",
    });
  });

  test("Should fail if user attempts to review someone else's appointment", async () => {
    mockReq.body = {
      userId: "user_unauthorized",
      appointmentId: "app123",
      rating: 5,
      comment: "Nice",
    };
    appointmentModelMock.findById.mockResolvedValue({
      _id: "app123",
      userId: "user_owner",
      status: "completed",
    });

    await addReview(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: "Unauthorized to review this appointment",
    });
  });

  test("Should fail if appointment is not completed yet", async () => {
    mockReq.body = {
      userId: "user123",
      appointmentId: "app123",
      rating: 5,
      comment: "Nice",
    };
    appointmentModelMock.findById.mockResolvedValue({
      _id: "app123",
      userId: "user123",
      status: "pending",
    });

    await addReview(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: "Only completed appointments can be reviewed",
    });
  });

  test("Should submit review and recalculate doctor average rating", async () => {
    mockReq.body = {
      userId: "user123",
      appointmentId: "app123",
      rating: 4,
      comment: "Good service",
    };
    appointmentModelMock.findById.mockResolvedValue({
      _id: "app123",
      userId: "user123",
      docId: "doc123",
      status: "completed",
    });
    reviewModelMock.findOne.mockResolvedValue(null);

    const saveMock = jest.fn().mockResolvedValue(true);
    reviewModelMock.prototype.save = saveMock;

    // Doctor reviews for average rating
    reviewModelMock.find.mockResolvedValue([
      { rating: 5 },
      { rating: 4 },
      { rating: 3 },
    ]);

    await addReview(mockReq, mockRes);

    expect(saveMock).toHaveBeenCalled();
    expect(reviewModelMock.find).toHaveBeenCalledWith({ doctorId: "doc123" });
    expect(doctorModelMock.findByIdAndUpdate).toHaveBeenCalledWith("doc123", {
      averageRating: 4,
    });
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: true,
      message: "Review submitted successfully",
    });
  });
});
