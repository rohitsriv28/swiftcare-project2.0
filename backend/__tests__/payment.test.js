import { beforeEach, describe, expect, jest, test } from "@jest/globals";

const appointmentModel = {
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
};
const transactionModel = {
  findOne: jest.fn(),
};
const cryptoMock = {
  createHmac: jest.fn(),
};

jest.unstable_mockModule("../models/appointmentModel.js", () => ({
  default: appointmentModel,
}));
jest.unstable_mockModule("../models/transactionModel.js", () => ({
  default: transactionModel,
}));
jest.unstable_mockModule("crypto", () => ({
  default: cryptoMock,
}));

// Set environment variables before importing paymentController to prevent Razorpay constructor validation errors
process.env.RAZORPAY_KEY_ID = "fake_razorpay_key";
process.env.RAZORPAY_KEY_SECRET = "fake_razorpay_secret";

const { verifyRazorpayPayment } =
  await import("../controllers/paymentController.js");

describe("Payment Controller Tests (Razorpay HMAC verification)", () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockReq = {
      body: {
        razorpay_payment_id: "pay_29QQoUBi66xm2f",
        razorpay_order_id: "order_9A33XWu170gUtm",
        razorpay_signature: "some_valid_hash",
      },
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    process.env.RAZORPAY_KEY_SECRET = "supersecret";
    delete process.env.RAZORPAY_KEY_ID;
    jest.clearAllMocks();
  });

  test("Should fail if signature strictly mismatches crypto digest", async () => {
    mockReq.body.razorpay_signature = "invalid_fraudulent_hash";

    cryptoMock.createHmac.mockReturnValue({
      update: jest.fn().mockReturnThis(),
      digest: jest
        .fn()
        .mockReturnValue("expected_valid_hash_generated_by_crypto"),
    });

    await verifyRazorpayPayment(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: "Payment verification failed: invalid signature",
    });
  });

  test("Should fail gracefully avoiding crashes if missing bodies entirely", async () => {
    mockReq.body = {};

    await verifyRazorpayPayment(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: "Missing required payment verification fields",
    });
  });
});
