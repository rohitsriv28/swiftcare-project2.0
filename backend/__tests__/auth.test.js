import jwt from "jsonwebtoken";
import authUser from "../middleware/authUser.js";

jest.mock("jsonwebtoken");

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
    // Clear mocks between tests
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
    
    // Mock jwt.verify to throw JsonWebTokenError
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
    
    // Mock jwt.verify to return a valid payload
    jwt.verify.mockReturnValue({ id: "user123" });

    await authUser(mockReq, mockRes, nextFunction);

    expect(jwt.verify).toHaveBeenCalledWith("validToken123", process.env.JWT_SECRET);
    expect(mockReq.body.userId).toBe("user123");
    expect(nextFunction).toHaveBeenCalled();
  });
});
