import validator from "validator";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import reviewModel from "../models/reviewModel.js";
import { TOKEN_EXPIRY } from "../config/constants.js";
import { uploadImageBuffer } from "../utils/cloudinaryUpload.js";

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

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: TOKEN_EXPIRY.user,
    });

    const userObj = user.toObject();
    delete userObj.password;

    res.status(201).json({
      success: true,
      message: "User Registration Successfull",
      user: userObj,
      token,
    });
  } catch (error) {
    console.error(error);
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
        .status(401)
        .json({ success: false, message: "User does not exist!" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: TOKEN_EXPIRY.user,
      });

      const userObj = user.toObject();
      delete userObj.password;

      res.status(200).json({
        success: true,
        message: "User Login Successfull",
        user: userObj,
        token,
      });
    } else {
      res.status(401).json({ success: false, message: "Invalid Credentials" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

//API for getting user data
const getProfile = async (req, res) => {
  try {
    const { userId } = req.body;
    const userData = await userModel.findById(userId).select("-password");
    if (!userData) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({
      success: true,
      message: "User data fetched successfully",
      userData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// API for updating user data
const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, phone, address, gender, dob } = req.body;
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
      const imageUpload = await uploadImageBuffer(userImage.buffer, "users");
      updatedData.image = imageUpload.secure_url;
    }

    // Final user data update
    const updatedUser = await userModel.findByIdAndUpdate(userId, updatedData, { new: true }).select("-password").lean();
    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Cascade user update to all their appointments
    await appointmentModel.updateMany({ userId: userId.toString() }, { $set: { userData: updatedUser } });

    res.status(200).json({
      success: true,
      message: "User profile updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

//API to book appointment
const bookAppointment = async (req, res) => {
  try {
    const { userId, docId, slotDate, slotTime } = req.body;

    // Validate that slotDate is today or in the future
    const [day, month, year] = slotDate.split("_").map(Number);
    const bookingDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (bookingDate < today) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Cannot book appointments in the past",
        });
    }

    const docData = await doctorModel.findById(docId).select("-password");
    if (!docData || !docData.availability) {
      return res
        .status(400)
        .json({ success: false, message: "Doctor not available!" });
    }

    // Attempt to book the slot atomically.
    // The query checks that the specific slot time is NOT already in that day's array.
    const updatedDoctor = await doctorModel.findOneAndUpdate(
      {
        _id: docId,
        [`slots_booked.${slotDate}`]: { $ne: slotTime },
      },
      {
        $push: { [`slots_booked.${slotDate}`]: slotTime },
      },
      { new: true },
    );

    // If no document was returned, it means the condition failed (slot already taken)
    if (!updatedDoctor) {
      return res
        .status(409)
        .json({ success: false, message: "Slot is no longer available!" });
    }

    const userData = await userModel.findById(userId).select("-password");
    if (!userData) {
      await doctorModel.findByIdAndUpdate(docId, {
        $pull: { [`slots_booked.${slotDate}`]: slotTime },
      });
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    delete docData.slots_booked; // history of slots booked removed

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

    try {
      await newAppointment.save();
    } catch (saveError) {
      // Rollback the slot if saving the appointment document fails for any reason
      await doctorModel.findByIdAndUpdate(docId, {
        $pull: { [`slots_booked.${slotDate}`]: slotTime },
      });
      throw saveError;
    }

    res.json({ success: true, message: "Appointment Booked Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
// API to get all appointments of user
const listAppointments = async (req, res) => {
  try {
    const { userId } = req.body;
    const { cursor, limit = 10 } = req.query;
    const limitNum = parseInt(limit, 10) || 10;

    const query = { userId };
    if (cursor) {
      query._id = { $lt: cursor };
    }

    const appointments = await appointmentModel
      .find(query)
      .sort({ _id: -1 })
      .limit(limitNum + 1)
      .lean();

    let nextCursor = null;
    let hasNextPage = false;

    if (appointments.length > limitNum) {
      hasNextPage = true;
      appointments.pop();
      nextCursor = appointments[appointments.length - 1]._id;
    }

    // Fetch all reviews by this user to determine which appointments are reviewed
    const userReviews = await reviewModel
      .find({ userId })
      .select("appointmentId rating comment");
      
    const reviewMap = new Map();
    userReviews.forEach((r) => {
      reviewMap.set(r.appointmentId.toString(), {
        rating: r.rating,
        comment: r.comment
      });
    });

    const appointmentsWithReviewStatus = appointments.map((app) => {
      const review = reviewMap.get(app._id.toString());
      return {
        ...app,
        hasReviewed: !!review,
        reviewData: review || null,
      };
    });

    res.json({
      success: true,
      data: appointmentsWithReviewStatus,
      appointments: appointmentsWithReviewStatus,
      pagination: {
        nextCursor,
        hasNextPage,
        limit: limitNum,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

//API to cancel appointment
const cancelAppointment = async (req, res) => {
  try {
    const { userId, appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);
    if (!appointmentData) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });
    }

    // Validating user
    if (appointmentData.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to cancel this appointment",
      });
    }

    if (appointmentData.isCancelled) {
      return res
        .status(409)
        .json({ success: false, message: "Appointment is already cancelled" });
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, {
      isCancelled: true,
      status: "cancelled",
    });

    try {
      // Atomically removing slot from database
      const { docId, slotDate, slotTime } = appointmentData;
      await doctorModel.findByIdAndUpdate(docId, {
        $pull: { [`slots_booked.${slotDate}`]: slotTime },
      });
    } catch (pullError) {
      // Rollback appointment cancellation status
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        isCancelled: false,
        status: appointmentData.status || "pending",
      });
      throw pullError;
    }
    res.json({ success: true, message: "Appointment cancelled successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// API to add a review for a doctor
const addReview = async (req, res) => {
  try {
    const { userId, appointmentId, rating, comment } = req.body;

    if (!appointmentId || !rating) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Appointment ID and rating are required",
        });
    }

    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ success: false, message: "Rating must be between 1 and 5" });
    }

    // Retrieve appointment
    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });
    }

    // Verify ownership
    if (appointment.userId.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Unauthorized to review this appointment",
        });
    }

    // Verify status
    if (appointment.status !== "completed") {
      return res
        .status(400)
        .json({
          success: false,
          message: "Only completed appointments can be reviewed",
        });
    }

    // Check existing review
    const existingReview = await reviewModel.findOne({ userId, appointmentId });
    if (existingReview) {
      return res
        .status(409)
        .json({
          success: false,
          message: "You have already reviewed this appointment",
        });
    }

    // Create review
    const newReview = new reviewModel({
      userId,
      doctorId: appointment.docId,
      appointmentId,
      rating,
      comment: comment?.substring(0, 500),
    });
    await newReview.save();

    // Recalculate average rating
    const doctorReviews = await reviewModel.find({
      doctorId: appointment.docId,
    });
    const sumRatings = doctorReviews.reduce((sum, rev) => sum + rev.rating, 0);
    const averageRating =
      doctorReviews.length > 0 ? sumRatings / doctorReviews.length : 0;

    await doctorModel.findByIdAndUpdate(appointment.docId, { averageRating });

    res
      .status(201)
      .json({ success: true, message: "Review submitted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// API to get doctor reviews (Public)
const getDoctorReviews = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalCount = await reviewModel.countDocuments({ doctorId });

    // Aggregate to calculate average rating (could also just return the denormalised value from doctor doc)
    const doctor = await doctorModel.findById(doctorId).select("averageRating");

    const reviews = await reviewModel
      .find({ doctorId })
      .populate("userId", "name image")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: reviews,
      totalCount,
      averageRating: doctor?.averageRating || 0,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// API for Doctor Recommendation System
const getRecommendations = async (req, res) => {
  try {
    const userId = req.userId;

    // Check if the user has booked at least 2 appointments
    const appointmentCount = await appointmentModel.countDocuments({ userId });
    if (appointmentCount < 2) {
      return res.json({ success: true, data: [] });
    }

    const { speciality } = req.query;

    // Base query: find available doctors, optionally filtered by speciality
    const query = { availability: true };
    if (speciality) {
      query.speciality = speciality;
    }

    const doctors = await doctorModel.find(query).select("-password").lean();

    if (!doctors.length) {
      return res.json({ success: true, data: [] });
    }

    // Identify the max values for normalization
    let maxFee = 1;
    let maxExperience = 1;

    doctors.forEach((doc) => {
      if (doc.fee > maxFee) maxFee = doc.fee;

      // Parse experience e.g. "4 Years" -> 4
      const expYears = parseInt(doc.experience) || 0;
      if (expYears > maxExperience) maxExperience = expYears;
    });

    // Generate dates for the next 7 days
    const today = new Date();
    const next7Days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const day = d.getDate();
      const month = d.getMonth() + 1;
      const year = d.getFullYear();
      next7Days.push(`${day}_${month}_${year}`);
    }

    // Score and rank doctors
    const scoredDoctors = doctors.map((doc) => {
      // 1. Rating Score (35%)
      const rating = doc.averageRating || 0;
      const ratingScore = (rating / 5) * 35;

      // 2. Availability Score (30%)
      // Check how many slots are booked in the next 7 days
      let slotsBookedIn7Days = 0;
      if (doc.slots_booked) {
        next7Days.forEach((dateStr) => {
          if (doc.slots_booked[dateStr]) {
            slotsBookedIn7Days += doc.slots_booked[dateStr].length;
          }
        });
      }
      // Assuming a doctor has about 10 slots a day -> 70 slots a week max.
      // Less booked slots -> higher availability score
      const maxSlotsWeekly = 70;
      const availabilityRatio = Math.max(
        0,
        (maxSlotsWeekly - slotsBookedIn7Days) / maxSlotsWeekly,
      );
      const availabilityScore = availabilityRatio * 30;

      // 3. Experience Score (20%)
      const expYears = parseInt(doc.experience) || 0;
      const experienceScore = (expYears / maxExperience) * 20;

      // 4. Fee Affordability Score (15%) - Inverse relationship
      // Lower fee = better affordability score
      const affordabilityRatio = 1 - doc.fee / maxFee;
      const affordabilityScore = affordabilityRatio * 15;

      const totalRecommendationScore =
        ratingScore + availabilityScore + experienceScore + affordabilityScore;

      return {
        ...doc,
        recommendationScore: totalRecommendationScore,
      };
    });

    // Sort by recommendation score (descending)
    scoredDoctors.sort((a, b) => b.recommendationScore - a.recommendationScore);

    res.json({
      success: true,
      data: scoredDoctors,
    });
  } catch (error) {
    console.error("Recommendation Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  registerUser,
  userLogin,
  getProfile,
  updateProfile,
  bookAppointment,
  listAppointments,
  cancelAppointment,
  addReview,
  getDoctorReviews,
  getRecommendations,
};
