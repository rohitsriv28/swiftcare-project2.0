import validator from "validator";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";
import userModel from "../models/userModel.js";

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

    // Name validation - should not contain numbers
    if (/\d/.test(name)) {
      return res
        .status(400)
        .json({ success: false, message: "Name should not contain numbers" });
    }

    // Email validation
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    // Password validation
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    // Degree validation - should only contain alphabets, spaces, periods, and commas, and start with alphabet
    if (!/^[A-Za-z][A-Za-z\s.,]*$/.test(degree)) {
      return res.status(400).json({
        success: false,
        message: "Degree should only contain alphabets, spaces, periods, commas and must start with an alphabet",
      });
    }

    // Fee validation - should not be negative
    const feeNumber = parseFloat(fee);
    if (isNaN(feeNumber) || feeNumber < 0) {
      return res.status(400).json({
        success: false,
        message: "Fee cannot be negative or non-numeric",
      });
    }

    // Image file validation
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedMimeTypes.includes(imageFile.mimetype)) {
      return res.status(400).json({
        success: false,
        message: "Image must be in JPEG, PNG, or WebP format",
      });
    }
    
    // Size validation (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (imageFile.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: "Image size should not exceed 5MB",
      });
    }

    // password encryption
    // hashing doc password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Check if doctor with same email already exists
    const existingDoctor = await doctorModel.findOne({ email });
    if (existingDoctor) {
      return res.status(400).json({
        success: false,
        message: "A doctor with this email already exists",
      });
    }

    // uploading image to cloudinary via stream mapped to buffer natively
    const uploadedImage = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: "image", folder: "doctors" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(imageFile.buffer);
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
      fee: feeNumber, // Using the parsed numeric value
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
      message: error.message || "Internal server error",
    });
  }
};

//API for admin login
// Dummy hash used to prevent timing-based email enumeration attacks.
// When email doesn't match, we still run bcrypt.compare() against this dummy
// so the response time is the same regardless of whether the email exists.
const DUMMY_HASH = "$2b$10$dummyhashfortimingatttackpreventionxx";

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    // Always run bcrypt.compare to prevent timing-based email enumeration
    const isEmailValid = email === process.env.ADMIN_EMAIL;
    const hashToCompare = isEmailValid
      ? process.env.ADMIN_PASSWORD_HASH
      : DUMMY_HASH;

    const isPasswordValid = await bcrypt.compare(password, hashToCompare);

    if (!isEmailValid || !isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { email, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    return res.status(200).json({
      success: true,
      message: "Admin logged in successfully",
      token: token,
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
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

//API for fetching all appointments with pagination
const allAppointments = async (req, res) => {
  try {
    // Get pagination parameters from query string
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Count total appointments for pagination info
    const total = await appointmentModel.countDocuments();

    // Fetch appointments with pagination
    const appointments = await appointmentModel
      .find({})
      .sort({ date: -1 }) // Sort by date descending (newest first)
      .skip(skip)
      .limit(limit);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      success: true,
      appointments,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API for appointment cancellation
const appointmentCancellationByAdmin = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);
    
    if (appointmentData.isCancelled) {
      return res.json({ success: false, message: "Appointment already cancelled" });
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, {
      isCancelled: true,
    });

    // Remove slots efficiently and atomically using pull
    const { docId, slotDate, slotTime } = appointmentData;
    await doctorModel.findByIdAndUpdate(docId, {
      $pull: { [`slots_booked.${slotDate}`]: slotTime },
    });
    res.json({ success: true, message: "Appointment cancelled successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

//API for Admin Dashboard Data
const adminDashboarddata = async (req, res) => {
  try {
    // 1. Core Counts directly from DB
    const totalDoctors = await doctorModel.countDocuments();
    const activeDoctors = await doctorModel.countDocuments({ availability: true });
    const totalAppointments = await appointmentModel.countDocuments();
    const totalPatients = await userModel.countDocuments();
    const pendingAppointments = await appointmentModel.countDocuments({ isCancelled: false });
    const paidAppointments = await appointmentModel.countDocuments({ isCancelled: false, payment: true });

    // 2. Today's Appointments
    const today = new Date();
    const todayDateString = `${today.getDate()}_${today.getMonth() + 1}_${today.getFullYear()}`;
    const todayAppointments = await appointmentModel.countDocuments({
      slotDate: todayDateString,
      isCancelled: false,
    });

    // 3. Total Revenue via Aggregation
    const revenueAgg = await appointmentModel.aggregate([
      { $match: { isCancelled: false, payment: true } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    // 4. Latest Appointments
    const latestAppointments = await appointmentModel
      .find({})
      .sort({ date: -1 })
      .limit(10);

    // 5. Top 5 Doctors via Aggregation
    const topDoctorsAgg = await appointmentModel.aggregate([
      { $match: { isCancelled: false, payment: true } },
      { $group: { _id: "$docId", appointments: { $sum: 1 }, revenue: { $sum: "$amount" } } },
      { $sort: { appointments: -1 } },
      { $limit: 5 }
    ]);
    
    // Fetch doctor metadata for top doctors only
    const doctorIds = topDoctorsAgg.map((agg) => agg._id);
    const topDocsMetadata = await doctorModel.find({ _id: { $in: doctorIds } });
    
    const topDoctors = topDoctorsAgg.map((agg) => {
      const doc = topDocsMetadata.find((d) => d._id.toString() === agg._id.toString());
      return {
        id: agg._id,
        name: doc?.name || "Unknown",
        image: doc?.image || "",
        speciality: doc?.speciality || "",
        appointments: agg.appointments,
        revenue: agg.revenue
      };
    });

    // 6. Appointments by Specialty
    const specialtyAgg = await appointmentModel.aggregate([
      { $match: { isCancelled: false, payment: true } },
      { $group: { _id: "$docData.speciality", count: { $sum: 1 }, revenue: { $sum: "$amount" } } }
    ]);
    const specialtyStats = specialtyAgg.map(agg => ({
      name: agg._id || "Unknown",
      count: agg.count,
      revenue: agg.revenue
    }));

    // 7. Last 30 Days mapping (Fetch only recent DB records rather than whole collection)
    const thirtyDaysAgo = Date.now() - 31 * 24 * 60 * 60 * 1000; // 31 days buffer
    const recentAppointments = await appointmentModel.find({ date: { $gte: thirtyDaysAgo } });

    const dashboardData = {
      stats: {
        totalDoctors,
        activeDoctors,
        totalAppointments,
        pendingAppointments,
        paidAppointments,
        totalPatients,
        todayAppointments,
        totalRevenue,
      },
      latestAppointments,
      topDoctors,
      specialtyStats,
      appointmentsByDay: getLast30DaysAppointments(recentAppointments),
    };

    res.json({ success: true, dashboardData });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper function to get appointments by day for last 30 days
function getLast30DaysAppointments(appointments) {
  const today = new Date();
  const result = [];

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const dateString = `${day}_${month}_${year}`;
    const displayDate = `${day}/${month}`;

    const allDayAppointments = appointments.filter(
      (app) => app.slotDate === dateString && !app.isCancelled
    );

    const paidDayAppointments = appointments.filter(
      (app) => app.slotDate === dateString && !app.isCancelled && app.payment
    );

    result.push({
      date: dateString,
      displayDate,
      allAppointments: allDayAppointments.length,
      paidAppointments: paidDayAppointments.length,
      revenue: paidDayAppointments.reduce((sum, app) => sum + app.amount, 0),
    });
  }

  return result;
}

export {
  addDoctor,
  adminLogin,
  allDoctors,
  allAppointments,
  appointmentCancellationByAdmin,
  adminDashboarddata,
};
