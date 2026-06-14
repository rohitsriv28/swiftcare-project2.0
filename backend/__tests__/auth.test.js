import { beforeEach, describe, expect, jest, test } from "@jest/globals";

jest.unstable_mockModule("jsonwebtoken", () => ({
  default: {
    verify: jest.fn(),
  },
}));

const jwt = (await import("jsonwebtoken")).default;
const authUser = (await import("../middleware/authUser.js")).default;

describe("Auth Middleware Tests", () => {
  let mockReq;
  let mockRes;
  let nextFunction;

  beforeEach(() => {
    mockReq = {
      headers: {},
      body: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
    jest.clearAllMocks();
  });

  test("Should fail if no token is provided", async () => {
    await authUser(mockReq, mockRes, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: "Unauthorized access!",
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  test("Should fail if token is invalid", async () => {
    mockReq.headers.authorization = "Bearer invalidToken123";

    const error = new Error("invalid token");
    error.name = "JsonWebTokenError";
    jwt.verify.mockImplementation(() => {
      throw error;
    });

    await authUser(mockReq, mockRes, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid token. Please login again.",
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  test("Should proceed if token is valid via Bearer schema", async () => {
    mockReq.headers.authorization = "Bearer validToken123";
    jwt.verify.mockReturnValue({ id: "user123" });

    await authUser(mockReq, mockRes, nextFunction);

    expect(jwt.verify).toHaveBeenCalledWith(
      "validToken123",
      process.env.JWT_SECRET
    );
    expect(mockReq.userId).toBe("user123");
    expect(mockReq.body.userId).toBe("user123");
    expect(nextFunction).toHaveBeenCalled();
  });
});
