import express from "express";
import cors from "cors";
import "dotenv/config";

import connectDB from "./config/db.js";
import connectCloudinary from "./config/cloudinary.js";

import adminRouter from "./routes/adminRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import userRouter from "./routes/userRoute.js";

import { apiLimiter } from "./middleware/rateLimiter.js";

import {
  getAllowedOrigins,
  PORT,
  REQUIRED_STARTUP_ENV_VARS,
} from "./config/constants.js";

import { startDoctorSlotPruningJob } from "./utils/slotScheduler.js";

const validateStartupEnvironment = () => {
  const missingVars = REQUIRED_STARTUP_ENV_VARS.filter(
    (key) => !process.env[key],
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}`,
    );
  }
};

const createCorsOptions = () => {
  const allowedOrigins = getAllowedOrigins();

  return {
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  };
};

const startServer = async () => {
  validateStartupEnvironment();

  console.log("🚀 Starting application...");

  const app = express();

  app.set("trust proxy", 1);

  app.use(express.json());
  app.use(cors(createCorsOptions()));

  // Cloudinary Connection
  connectCloudinary();
  console.log("☁️ Cloudinary configured successfully");

  // MongoDB Connection
  await connectDB();
  console.log("🍃 MongoDB connected successfully");

  // Global API Rate Limiter
  app.use("/api", apiLimiter);

  // Routes
  app.use("/api/admin", adminRouter);
  app.use("/api/doctor", doctorRouter);
  app.use("/api/user", userRouter);

  // Health Check Route
  app.get("/", (req, res) => {
    res.status(200).json({
      success: true,
      message: "API is running",
    });
  });

  // 404 Handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: "Route not found",
    });
  });

  // Global Error Handler
  app.use((err, req, res, next) => {
    if (process.env.NODE_ENV === "development") {
      console.error("❌ Error:", err.stack || err);
    } else {
      console.error("❌ Error:", err.message || "Internal server error");
    }

    res.status(err.status || 500).json({
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? err.message || "Internal server error"
          : "Internal server error",
    });
  });

  // Background Jobs
  startDoctorSlotPruningJob();
  console.log("🕒 Doctor slot pruning scheduler started");

  // Start Server
  app.listen(PORT, () => {
    console.log("=================================");
    console.log(`✅ Server started successfully`);
    console.log(`🌐 Running on port ${PORT}`);
    console.log(`🛠️ Environment: ${process.env.NODE_ENV || "development"}`);
    console.log("=================================");
  });
};

startServer().catch((error) => {
  console.error("💥 Application startup failed");
  console.error(error.stack || error);
  process.exit(1);
});
