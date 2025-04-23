import validator from "validator";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";

//API for creating a new user
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }
    //email validation
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }
    //password validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be atleast 6 characters",
      });
    }

    // password encryption
    // hashing doc password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      name,
      email,
      password: hashedPassword,
    };

    const newUser = new userModel(userData);
    const user = await newUser.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.status(201).json({
      success: true,
      message: "User Registration Successfull",
      user,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// API for user login
const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      return res
        .status(500)
        .json({ success: false, message: "User does not exist!" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      res.status(200).json({
        success: true,
        message: "User Login Successfull",
        user,
        token,
      });
    } else {
      res.status(500).json({ success: false, message: "Invalid Credentials" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

//API for getting user data
const getProfile = async (req, res) => {
  try {
    const { userId } = req.body;
    const userData = await userModel.findById(userId).select("-password");
    res.status(200).json({
      success: true,
      message: "User data fetched successfully",
      userData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// API for updating user data
const updateProfile = async (req, res) => {
  try {
    const { userId, name, phone, address, gender, dob } = req.body;
    const userImage = req.file;

    // Required field validation
    if (!name || !phone || !gender || !dob) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Prepare updated data object
    const updatedData = {
      name,
      phone,
      dob,
      gender,
    };

    // Parse address only if it's valid
    if (address && address !== "undefined") {
      updatedData.address = JSON.parse(address);
    }

    // Upload image if it exists
    if (userImage) {
      const imageUpload = await cloudinary.uploader.upload(userImage.path, {
        resource_type: "image",
      });
      updatedData.image = imageUpload.secure_url;
    }

    // Final user data update
    await userModel.findByIdAndUpdate(userId, updatedData);

    res.status(200).json({
      success: true,
      message: "User profile updated successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

//API to book appointment
const bookAppointment = async (req, res) => {
  try {
    const { userId, docId, slotDate, slotTime } = req.body;

    const docData = await doctorModel.findById(docId).select("-password");
    if (!docData.availability) {
      return res.json({ success: false, message: "Doctor not available!" });
    }
    let slots_booked = docData.slots_booked;
    //Checking slots availability
    if (slots_booked[slotDate]) {
      if (slots_booked[slotDate].includes(slotTime)) {
        return res.json({ success: false, message: "Slots not available!" });
      } else {
        slots_booked[slotDate].push(slotTime);
      }
    } else {
      slots_booked[slotDate] = [];
      slots_booked[slotDate].push(slotTime);
    }

    const userData = await userModel.findById(userId).select("-password");
    delete docData.slots_booked; //history of slots booked removed

    const appointmentData = {
      userId,
      docId,
      userData,
      docData,
      amount: docData.fee,
      slotDate,
      slotTime,
      date: Date.now(),
      payment: false,
      isCancelled: false,
      isComplete: false,
    };

    const newAppointment = new appointmentModel(appointmentData);

    await newAppointment.save();

    //Save new slots in docData
    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    res.json({ success: true, message: "Appointment Booked Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export { registerUser, userLogin, getProfile, updateProfile, bookAppointment };
