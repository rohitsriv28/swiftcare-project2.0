import jwt from "jsonwebtoken";
import { getBearerToken } from "./getBearerToken.js";

// admin authentication middleware
const authAdmin = async (req, res, next) => {
  try {
    const atoken = getBearerToken(req);

    if (!atoken) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized access!" });
    }
    const decodedToken = jwt.verify(atoken, process.env.JWT_SECRET);
    if (decodedToken.email !== process.env.ADMIN_EMAIL) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized access" });
    }
    req.admin = decodedToken;
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
    console.error("Admin auth error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export default authAdmin;
