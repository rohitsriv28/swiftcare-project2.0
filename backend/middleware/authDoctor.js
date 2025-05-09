import jwt from "jsonwebtoken";

// doctor authentication middleware
const authDoctor = async (req, res, next) => {
    
  try {
    const authHeader = req.headers["authorization"];
    const dToken = authHeader && authHeader.split(" ")[1]; // Extract token from "Bearer <token>"
    if (!dToken) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized access!" });
    }
    const decodedToken = jwt.verify(dToken, process.env.JWT_SECRET);
    req.body.docId = decodedToken.id;
    next();
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
      // "Internal server error"
    });
  }
};

export default authDoctor;
