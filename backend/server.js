import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import "dotenv/config";
import connectCloudinary from "./config/cloudinary.js";

// app config
const app = express();
const port = process.env.PORT || 8001;
connectDB();
connectCloudinary();

// middleware
app.use(express.json());
app.use(cors());

// api routes
app.get("/", (req, res) => {
  res.status(200).send("API is running");
});

app.listen(port, () => console.log("Server is running on port: ", port));
