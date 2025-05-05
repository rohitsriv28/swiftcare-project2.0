import validator from "validator";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import jwt from "jsonwebtoken";

//API for adding doctor
const addDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      speciality,
      experience,
      degree,
      about,
      fee,
      address,
    } = req.body;
    const imageFile = req.file;

    // verifying all required fields
    if (
      !name ||
      !email ||
      !password ||
      !speciality ||
      !experience ||
      !degree ||
      !about ||
      !fee ||
      !address ||
      !imageFile
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // email validation
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }

    // password validation
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be atleast 6 characters",
      });
    }

    // password encryption
    // hashing doc password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // uploading image to cloudinary
    const uploadedImage = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: "image",
      folder: "doctors",
    });

    const imageUrl = uploadedImage.secure_url;

    const doctorData = {
      name,
      email,
      password: hashedPassword,
      speciality,
      experience,
      degree,
      about,
      fee,
      address: typeof address === "string" ? JSON.parse(address) : address,
      date: Date.now(),
      image: imageUrl,
    };
    const newDoctor = new doctorModel(doctorData);
    await newDoctor.save();
    res
      .status(201)
      .json({ success: true, message: "Doctor added successfully" });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
      // "Internal server error"
    });
  }
};

//API for admin login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(
        { email }, // Store email as payload
        process.env.JWT_SECRET,
        { expiresIn: "1h" } // Now expiresIn will work
      );

      return res.status(200).json({
        success: true,
        message: "Admin logged in successfully",
        token: token,
      });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
      // "Internal server error"
    });
  }
};

// All Doctor API
const allDoctors = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select("-password");
    res.json({ success: true, data: doctors });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { addDoctor, adminLogin, allDoctors };
