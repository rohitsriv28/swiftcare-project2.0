import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import "dotenv/config";
import connectCloudinary from "./config/cloudinary.js";
import adminRouter from "./routes/adminRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import userRouter from "./routes/userRoute.js";

// app config
const app = express();
const port = process.env.PORT || 8001;
connectDB();
connectCloudinary();

// middleware
app.use(express.json());
app.use(cors());

// api routes
app.use("/api/admin", adminRouter); // localhost:8001/api/admin/endpoint_name
app.use("/api/doctor", doctorRouter); // localhost:8001/api/doctor/endpoint_name
app.use("/api/user", userRouter); // localhost:8001/api/user/endpoint_name

app.get("/", (req, res) => {
  res.status(200).send("API is running)");
});

app.listen(port, () => console.log("Server is running on Port: ", port));

