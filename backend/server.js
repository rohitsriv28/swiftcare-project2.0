import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import "dotenv/config";
import connectCloudinary from "./config/cloudinary.js";
import adminRouter from "./routes/adminRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import userRouter from "./routes/userRoute.js";
import { apiLimiter } from "./middleware/rateLimiter.js";

// Startup validation: ensure critical env vars are set
const requiredEnvVars = [
  "MONGO_URI",
  "JWT_SECRET",
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD_HASH",
  "CLOUDINARY_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];
const missingVars = requiredEnvVars.filter((v) => !process.env[v]);
if (missingVars.length > 0) {
  console.error(
    `❌ Missing required environment variables: ${missingVars.join(", ")}`
  );
  console.error("Please check your .env file. See .env.example for reference.");
  process.exit(1);
}

// app config
const app = express();
const port = process.env.PORT || 8001;
connectDB();
connectCloudinary();

// Trust proxy (required for rate limiting behind reverse proxies like Nginx/Cloudflare)
app.set("trust proxy", 1);

// middleware
app.use(express.json());
app.use(cors());

// Global API rate limiter (100 requests per 15 min per IP)
app.use("/api", apiLimiter);

// api routes
app.use("/api/admin", adminRouter); // localhost:8001/api/admin/endpoint_name
app.use("/api/doctor", doctorRouter); // localhost:8001/api/doctor/endpoint_name
app.use("/api/user", userRouter); // localhost:8001/api/user/endpoint_name

app.get("/", (req, res) => {
  res.status(200).send("API is running)");
});

app.listen(port, () => console.log("Server is running on Port: ", port));
