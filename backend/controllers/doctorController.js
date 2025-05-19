import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import Fuse from "fuse.js";

const changeAvailability = async (req, res) => {
  try {
    const { docId } = req.body;
    const docData = await doctorModel.findById(docId);
    await doctorModel.findByIdAndUpdate(docId, {
      availability: !docData.availability,
    });
    res.json({
      success: true,
      message: "Availability changed successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const doctorList = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select(["-password", "-email"]);
    res.json({ success: true, doctors });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API for Doctor Login
const doctorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const doctor = await doctorModel.findOne({ email });
    if (!doctor) {
      return res.status(400).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // Compare the provided password with the hashed password
    const isPasswordValid = await bcrypt.compare(password, doctor.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { id: doctor._id, role: "doctor" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
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
    console.log(error);
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
      appointments,
    });
  } catch (error) {
    console.log(error);
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

    if (appointmentData && appointmentData.docId.toString() === docId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        isComplete: true,
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
    console.log(error);
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

    if (appointmentData && appointmentData.docId.toString() === docId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        isCancelled: true,
      });
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
    console.log(error);
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
      dashboardData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//API for Doctor Profile
const doctorProfile = async (req, res) => {
  try {
    const { docId } = req.body;
    const profileData = await doctorModel.findById(docId).select("-password");
    res.json({
      success: true,
      profileData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//API to Update Doctor Profile
const updateDoctorProfile = async (req, res) => {
  try {
    const { docId, fee, address, availability, about } = req.body;

    const parsedAddress =
      typeof address === "string" ? JSON.parse(address) : address;

    let imageUrl = null;

    if (req.file) {
      imageUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString(
        "base64"
      )}`;
    }

    await doctorModel.findByIdAndUpdate(docId, {
      fee,
      address,
      availability,
      about,
      ...(imageUrl && { image: imageUrl }),
    });
    res.json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.log(error);
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
      doctors: matchedDoctors,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
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
};
