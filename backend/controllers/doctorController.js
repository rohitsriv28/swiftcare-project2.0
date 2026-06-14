import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import Fuse from "fuse.js";
import { TOKEN_EXPIRY } from "../config/constants.js";
import { uploadImageBuffer } from "../utils/cloudinaryUpload.js";

const changeAvailability = async (req, res) => {
  try {
    const { docId } = req.body;
    const docData = await doctorModel.findById(docId);
    if (!docData) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }
    await doctorModel.findByIdAndUpdate(docId, {
      availability: !docData.availability,
    });
    res.json({
      success: true,
      message: "Availability changed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const doctorList = async (req, res) => {
  try {
    const { cursor, limit = 10 } = req.query;
    const limitNum = parseInt(limit, 10) || 10;
    
    // Build query with cursor
    const query = {};
    if (cursor) {
      // Decode cursor assuming it's the last seen _id
      query._id = { $lt: cursor };
    }

    const doctors = await doctorModel
      .find(query)
      .select(["-password", "-email"])
      .sort({ _id: -1 })
      .limit(limitNum + 1) // Fetch one extra to determine if there's a next page
      .lean();

    let nextCursor = null;
    let hasNextPage = false;
    
    // If we fetched more than the limit, we have a next page
    if (doctors.length > limitNum) {
      hasNextPage = true;
      doctors.pop(); // Remove the extra item
      // The cursor for the next page is the _id of the last item in this page
      nextCursor = doctors[doctors.length - 1]._id;
    }

    res.json({ 
      success: true, 
      data: doctors, 
      doctors,
      pagination: {
        nextCursor,
        hasNextPage,
        limit: limitNum
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Dummy hash used to prevent timing-based email enumeration attacks.
const DUMMY_HASH = "$2b$10$dummyhashfortimingatttackpreventionxx";

// API for Doctor Login
const doctorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const doctor = await doctorModel.findOne({ email });

    const hashToCompare = doctor ? doctor.password : DUMMY_HASH;
    const isPasswordValid = await bcrypt.compare(password, hashToCompare);

    if (!doctor || !isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { id: doctor._id, role: "doctor" },
      process.env.JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY.doctor }
    );

    res.json({
      success: true,
      message: "Login successful",
      token, // Return the token
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//API for Doctor Appointments - Doc Panel
const doctorAppointments = async (req, res) => {
  try {
    const { docId } = req.body;
    const appointments = await appointmentModel.find({ docId });
    res.json({
      success: true,
      data: appointments,
      appointments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//API to mark appointment as completed
const markAppointmentCompleted = async (req, res) => {
  try {
    const { docId, appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);

    if (!appointmentData) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (appointmentData && appointmentData.docId.toString() === docId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        isComplete: true,
        status: "completed",
      });
      res.json({
        success: true,
        message: "Appointment marked as completed",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Invalid appointment ID",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//API to mark appointment as cancelled
const markAppointmentCancelled = async (req, res) => {
  try {
    const { docId, appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);

    if (!appointmentData) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (appointmentData && appointmentData.docId.toString() === docId) {
      if (appointmentData.isCancelled) {
        return res.status(409).json({ success: false, message: "Appointment is already cancelled" });
      }

      await appointmentModel.findByIdAndUpdate(appointmentId, {
        isCancelled: true,
        status: "cancelled",
      });

      try {
        // Free the slot organically
        const { slotDate, slotTime } = appointmentData;
        await doctorModel.findByIdAndUpdate(docId, {
          $pull: { [`slots_booked.${slotDate}`]: slotTime },
        });
      } catch (pullError) {
        // Rollback cancellation
        await appointmentModel.findByIdAndUpdate(appointmentId, {
          isCancelled: false,
          status: appointmentData.status || "pending",
        });
        throw pullError;
      }

      res.json({
        success: true,
        message: "Appointment marked as cancelled",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Invalid appointment ID",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//API for Doctor Dashboard Data
const doctorDashboardData = async (req, res) => {
  try {
    const { docId } = req.body;
    const appointments = await appointmentModel.find({ docId });

    let totalEarnings = 0; // Paid online appointments + completed cash appointments
    let completedEarnings = 0; // Paid online appointments + completed cash appointments
    let pendingPayments = 0; // Only uncompleted appointment amounts
    let completedAppointments = 0;
    let cancelledAppointments = 0;
    let pendingAppointments = 0;

    appointments.forEach((item) => {
      if (item.isComplete && !item.isCancelled) {
        completedAppointments++;
        if (item.payment) {
          // For online payments that are marked as paid
          completedEarnings += item.amount;
          totalEarnings += item.amount; // Only add to total if payment is true
        } else {
          // For completed cash appointments, consider them as paid
          completedEarnings += item.amount;
          totalEarnings += item.amount; // Add to total earnings since it's completed (cash payment assumed received)
        }
      } else if (item.isCancelled) {
        cancelledAppointments++;
      } else {
        pendingAppointments++;
        pendingPayments += item.amount; // Only uncompleted appointments are in pending payments
      }
    });

    let patients = [];
    appointments.forEach((item) => {
      if (!patients.includes(item.userId)) {
        patients.push(item.userId);
      }
    });

    const dashboardData = {
      totalEarnings, // This now reflects only paid appointments
      completedEarnings,
      pendingPayments,
      appointments: appointments.length,
      completedAppointments,
      cancelledAppointments,
      pendingAppointments,
      patients: patients.length,
      upcomingAppointments: appointments
        .filter((app) => !app.isComplete && !app.isCancelled)
        .sort((a, b) => new Date(a.slotDate) - new Date(b.slotDate))
        .slice(0, 5),
      recentAppointments: appointments
        .filter((app) => app.isComplete && !app.isCancelled)
        .sort((a, b) => new Date(b.slotDate) - new Date(a.slotDate))
        .slice(0, 5),
    };

    res.json({
      success: true,
      data: dashboardData,
      dashboardData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//API for Doctor Profile
const doctorProfile = async (req, res) => {
  try {
    const docId = req.docId;
    let profileData = await doctorModel.findById(docId).select("-password");

    if (!profileData) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    res.json({
      success: true,
      data: profileData,
      profileData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//API to Update Doctor Profile
const updateDoctorProfile = async (req, res) => {
  try {
    const docId = req.docId;
    const { fee, address, availability, about } = req.body;

    const parsedAddress =
      typeof address === "string" ? JSON.parse(address) : address;

    let imageUrl = null;

    if (req.file) {
      const imageUpload = await uploadImageBuffer(req.file.buffer, "doctors");
      imageUrl = imageUpload.secure_url;
    }

    const updatedDoctor = await doctorModel.findByIdAndUpdate(docId, {
      fee,
      address: parsedAddress,
      availability,
      about,
      ...(imageUrl && { image: imageUrl }),
    });
    if (!updatedDoctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }
    res.json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// API for fuzzy search doctors by name and speciality
const searchDoctors = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || query.trim() === "") {
      return res.json({ success: true, doctors: [] });
    }

    // Get all doctors from database (without passwords)
    const doctors = await doctorModel
      .find({
        availability: true, // Only search for available doctors
      })
      .select("-password");

    // Configure fuse.js options
    const options = {
      keys: [
        {
          name: "name",
          weight: 0.6,
        },
        {
          name: "speciality",
          weight: 0.4,
        },
      ],
      includeScore: true,
      threshold: 0.4, // Lower threshold means more strict matching
      minMatchCharLength: 3,
      ignoreLocation: true, // Search anywhere in the string
      shouldSort: true,
      includeMatches: true,
    };

    const fuse = new Fuse(doctors, options);

    const results = fuse.search(query);

    // Format the results to include only necessary data
    const matchedDoctors = results.map((result) => ({
      _id: result.item._id,
      name: result.item.name,
      speciality: result.item.speciality,
      image: result.item.image,
      fee: result.item.fee,
      experience: result.item.experience,
      score: result.score, // Lower score means better match
    }));

    res.json({
      success: true,
      data: matchedDoctors,
      doctors: matchedDoctors,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getDoctorProfilePublic = async (req, res) => {
  try {
    const { docId } = req.params;
    if (!mongoose.isValidObjectId(docId)) {
      return res.status(400).json({ success: false, message: "Invalid doctor ID format" });
    }
    const doctor = await doctorModel.findById(docId).select("-password -email");
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }
    res.json({
      success: true,
      data: doctor,
      profileData: doctor,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export {
  changeAvailability,
  doctorList,
  doctorLogin,
  doctorAppointments,
  markAppointmentCompleted,
  markAppointmentCancelled,
  doctorDashboardData,
  doctorProfile,
  updateDoctorProfile,
  searchDoctors,
  getDoctorProfilePublic,
};
