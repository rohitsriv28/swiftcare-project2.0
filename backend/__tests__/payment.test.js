import { verifyRazorpayPayment } from "../controllers/paymentController.js";
import appointmentModel from "../models/appointmentModel.js";
import crypto from "crypto";

jest.mock("../models/appointmentModel.js");
jest.mock("crypto");

// Create a mock razorpay instance using global since it's injected inside controller closure
global.razorpayInstance = {
  orders: {
    fetch: jest.fn()
  }
};

describe("Payment Controller Tests (Razorpay HMAC verification)", () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockReq = {
      body: {
        razorpay_payment_id: "pay_29QQoUBi66xm2f",
        razorpay_order_id: "order_9A33XWu170gUtm",
        razorpay_signature: "some_valid_hash"
      }
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    process.env.RAZORPAY_KEY_SECRET = "supersecret";
    jest.clearAllMocks();
  });

  test("Should fail if signature strictly mismatches crypto digest", async () => {
    mockReq.body.razorpay_signature = "invalid_fraudulent_hash";
    
    // Mock the crypto digest creation to return something different
    crypto.createHmac.mockReturnValue({
      update: jest.fn().mockReturnThis(),
      digest: jest.fn().mockReturnValue("expected_valid_hash_generated_by_crypto")
    });

    await verifyRazorpayPayment(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: "Payment verification failed: invalid signature"
    });
  });

  test("Should fail gracefully avoiding crashes if missing bodies entirely", async () => {
    mockReq.body = {};
    
    await verifyRazorpayPayment(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: "Missing required payment verification fields"
    });
  });
});
