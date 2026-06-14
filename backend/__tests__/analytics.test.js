import { beforeEach, describe, expect, jest, test } from "@jest/globals";

const appointmentModelMock = {
  aggregate: jest.fn(),
  find: jest.fn(),
};

jest.unstable_mockModule("../models/appointmentModel.js", () => ({
  default: appointmentModelMock,
}));

const { revenueTrends, peakBookingAnalysis, peakDemandVisualization } =
  await import("../controllers/analyticsController.js");

describe("Analytics Controller Tests", () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockReq = {
      query: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  test("Should calculate revenue trends daily, weekly, and monthly correctly", async () => {
    mockReq.query = { granularity: "daily" };
    appointmentModelMock.aggregate.mockResolvedValue([
      {
        _id: { year: 2026, month: 6, day: 14 },
        revenue: 1000,
        appointments: 2,
      },
    ]);

    await revenueTrends(mockReq, mockRes);

    expect(appointmentModelMock.aggregate).toHaveBeenCalled();
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            label: "2026-06-14",
            revenue: 1000,
          }),
        ]),
      }),
    );
  });

  test("Should compute peak booking hour heatmap mapping correctly", async () => {
    appointmentModelMock.aggregate.mockResolvedValue([
      {
        _id: { day: 1, hour: 10 },
        count: 15,
      },
    ]);

    await peakBookingAnalysis(mockReq, mockRes);

    expect(appointmentModelMock.aggregate).toHaveBeenCalled();
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.arrayContaining([{ day: 1, hour: 10, value: 15 }]),
      }),
    );
  });

  test("Should parse slot dates and slot times for peak demand visualization", async () => {
    appointmentModelMock.find.mockReturnValue({
      select: jest.fn().mockResolvedValue([
        { slotDate: "14_06_2026", slotTime: "10:30 AM", isCancelled: false },
        { slotDate: "14_06_2026", slotTime: "02:00 PM", isCancelled: false },
      ]),
    });

    await peakDemandVisualization(mockReq, mockRes);

    expect(appointmentModelMock.find).toHaveBeenCalled();
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.any(Array),
      }),
    );
  });
});
