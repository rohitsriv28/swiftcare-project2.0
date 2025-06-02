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
        { expiresIn: "12h" }
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
    await appointmentModel.findByIdAndUpdate(appointmentId, {
      isCancelled: true,
    });

    // Removing slots from DocData
    const { docId, slotDate, slotTime } = appointmentData;
    const docData = await doctorModel.findById(docId);
    let slots_booked = docData.slots_booked;
    slots_booked[slotDate] = slots_booked[slotDate].filter(
      (e) => e !== slotTime
    );
    await doctorModel.findByIdAndUpdate(docId, { slots_booked });
    res.json({ success: true, message: "Appointment cancelled successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

//API for Admin Dashboard Data
const adminDashboarddata = async (req, res) => {
  try {
    const doctors = await doctorModel.find({});
    const appointments = await appointmentModel.find({});
    const users = await userModel.find({});

    // Calculate active doctors
    const activeDoctors = doctors.filter((doc) => doc.availability).length;

    // Calculate today's date string in the same format as slotDate
    const today = new Date();
    const todayDateString = `${today.getDate()}_${
      today.getMonth() + 1
    }_${today.getFullYear()}`;

    // Filter today's appointments
    const todayAppointments = appointments.filter(
      (app) => app.slotDate === todayDateString && !app.isCancelled
    );

    // Calculate total revenue from completed and PAID appointments only
    const totalRevenue = appointments.reduce(
      (sum, app) => sum + (app.isCancelled || !app.payment ? 0 : app.amount),
      0
    );

    // Get last 10 appointments sorted by date
    const latestAppointments = appointments
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);

    // Get top 5 doctors by number of appointments
    const doctorAppointments = {};
    appointments.forEach((app) => {
      if (!app.isCancelled && app.payment) {
        // Only count paid appointments
        const docId = app.docId.toString();
        doctorAppointments[docId] = (doctorAppointments[docId] || 0) + 1;
      }
    });

    const topDoctors = Object.entries(doctorAppointments)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([docId, count]) => {
        const doctor = doctors.find((d) => d._id.toString() === docId);
        return {
          id: docId,
          name: doctor?.name || "Unknown",
          image: doctor?.image || "",
          speciality: doctor?.speciality || "",
          appointments: count,
          revenue: appointments
            .filter(
              (a) => a.docId.toString() === docId && !a.isCancelled && a.payment
            ) // Only count paid appointments
            .reduce((sum, a) => sum + a.amount, 0),
        };
      });

    // Get appointments by specialty
    const specialtyStats = {};
    appointments.forEach((app) => {
      if (!app.isCancelled && app.payment) {
        // Only count paid appointments
        const specialty = app.docData?.speciality || "Unknown";
        specialtyStats[specialty] = specialtyStats[specialty] || {
          count: 0,
          revenue: 0,
        };
        specialtyStats[specialty].count++;
        specialtyStats[specialty].revenue += app.amount;
      }
    });

    const dashboardData = {
      stats: {
        totalDoctors: doctors.length,
        activeDoctors,
        totalAppointments: appointments.length,
        pendingAppointments: appointments.filter((a) => !a.isCancelled).length,
        paidAppointments: appointments.filter(
          (a) => !a.isCancelled && a.payment
        ).length,
        totalPatients: users.length,
        todayAppointments: todayAppointments.length,
        totalRevenue,
      },
      latestAppointments,
      topDoctors,
      specialtyStats: Object.entries(specialtyStats).map(([name, stats]) => ({
        name,
        ...stats,
      })),
      appointmentsByDay: getLast30DaysAppointments(appointments),
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
