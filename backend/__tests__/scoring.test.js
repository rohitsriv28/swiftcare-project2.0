import { beforeEach, describe, expect, jest, test } from "@jest/globals";

const doctorModelMock = {
  findById: jest.fn(),
};

const appointmentModelMock = {
  find: jest.fn(),
  findById: jest.fn(),
};

jest.unstable_mockModule("../models/doctorModel.js", () => ({
  default: doctorModelMock,
}));

jest.unstable_mockModule("../models/appointmentModel.js", () => ({
  default: appointmentModelMock,
}));

const { calculatePerformanceScore, calculateCancellationRisk } =
  await import("../utils/scoringService.js");

describe("Scoring Service Utility Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Should calculate composite doctor performance rating correctly", async () => {
    doctorModelMock.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: "doc123",
        averageRating: 4.5,
      }),
    });

    // Mock completed appointments to calculate revenue and volume
    appointmentModelMock.find.mockResolvedValue([
      { _id: "app1", amount: 1000 },
      { _id: "app2", amount: 1500 },
    ]);

    const result = await calculatePerformanceScore("doc123");

    expect(doctorModelMock.findById).toHaveBeenCalledWith("doc123");
    expect(appointmentModelMock.find).toHaveBeenCalledWith({
      docId: "doc123",
      isComplete: true,
      isCancelled: false,
    });

    // 1. Appointment Score (max 35) -> (2 / 200) * 35 = 0.35
    // 2. Revenue Score (max 35) -> (2500 / 50000) * 35 = 1.75
    // 3. Rating Score (max 30) -> (4.5 / 5) * 30 = 27
    // Total: 0.35 + 1.75 + 27 = 29.1
    expect(result.scores.totalScore).toBe(29.1);
  });

  test("Should calculate patient cancellation risk metrics correctly", async () => {
    const mockAppointment = {
      _id: "app123",
      userId: "user123",
      payment: false, // Unpaid/Cash -> +35 risk score
      createdAt: new Date(),
      slotDate: "20_06_2030", // Far in the future -> lead time > 14 days -> +30 risk score
    };

    appointmentModelMock.findById.mockResolvedValue(mockAppointment);

    // Past cancellations history count
    appointmentModelMock.find.mockResolvedValue([
      { _id: "past1", isCancelled: true },
      { _id: "past2", isCancelled: true },
      { _id: "past3", isCancelled: true },
      { _id: "past4", isCancelled: true }, // Frequent cancellations (> 3) -> +35 risk score
    ]);

    const result = await calculateCancellationRisk("app123");

    expect(appointmentModelMock.findById).toHaveBeenCalledWith("app123");
    expect(appointmentModelMock.find).toHaveBeenCalledWith({
      userId: "user123",
    });

    // Risk: 35 (unpaid) + 30 (lead time) + 35 (history) = 100 max risk
    expect(result.riskScore).toBe(100);
    expect(result.riskLevel).toBe("High");
  });
});
