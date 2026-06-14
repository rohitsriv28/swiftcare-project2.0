import jwt from "jsonwebtoken";
import { getBearerToken } from "./getBearerToken.js";

// user authentication middleware
const authUser = async (req, res, next) => {
  try {
    const token = getBearerToken(req);

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized access!" });
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decodedToken;
    req.userId = decodedToken.id;
    if (!req.body) req.body = {};
    req.body.userId = decodedToken.id;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please login again.",
      });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Please login again.",
      });
    }
    console.error("User auth error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export default authUser;
