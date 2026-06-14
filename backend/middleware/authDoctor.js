import jwt from "jsonwebtoken";
import { getBearerToken } from "./getBearerToken.js";

// doctor authentication middleware
const authDoctor = async (req, res, next) => {
  try {
    const dToken = getBearerToken(req);

    if (!dToken) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized access!" });
    }
    const decodedToken = jwt.verify(dToken, process.env.JWT_SECRET);
    req.doctor = decodedToken;
    req.docId = decodedToken.id;
    if (!req.body) req.body = {};
    req.body.docId = decodedToken.id;
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
    console.error("Doctor auth error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export default authDoctor;
