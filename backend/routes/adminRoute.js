import express from "express";
import {
  addDoctor,
  adminDashboarddata,
  adminLogin,
  allAppointments,
  allDoctors,
  appointmentCancellationByAdmin,
  getDoctorPerformance,
  getAllDoctorPerformance,
  getCancellationRisk,
} from "../controllers/adminController.js";
import upload from "../middleware/multer.js";
import authAdmin from "../middleware/authAdmin.js";
import {
  revenueTrends,
  peakBookingAnalysis,
  peakDemandVisualization
} from "../controllers/analyticsController.js";
import {
  changeAvailability,
  searchDoctors,
} from "../controllers/doctorController.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { validateRequests } from "../validators/validateRequests.js";
import { 
  adminLoginValidation, 
  addDoctorValidation, 
  changeAvailabilityValidation, 
  adminAppointmentCancelValidation 
} from "../validators/adminValidator.js";

const adminRouter = express.Router();

adminRouter.post("/login", authLimiter, adminLoginValidation, validateRequests, adminLogin);
adminRouter.post("/add-doctor", authAdmin, upload.single("image"), addDoctorValidation, validateRequests, addDoctor);
adminRouter.post("/all-doctors", authAdmin, allDoctors);
adminRouter.post("/search-doctors", authAdmin, searchDoctors);
adminRouter.post("/change-availability", authAdmin, changeAvailabilityValidation, validateRequests, changeAvailability);
adminRouter.get("/all-appointments", authAdmin, allAppointments);
adminRouter.post(
  "/cancel-appointment",
  authAdmin,
  adminAppointmentCancelValidation,
  validateRequests,
  appointmentCancellationByAdmin
);
adminRouter.get("/dashboard", authAdmin, adminDashboarddata);

// Performance Routes
adminRouter.get("/doctor-performance/:doctorId", authAdmin, getDoctorPerformance);
adminRouter.get("/all-doctor-performance", authAdmin, getAllDoctorPerformance);

// Analytics Routes
adminRouter.get("/revenue-trends", authAdmin, revenueTrends);
adminRouter.get("/peak-booking-analysis", authAdmin, peakBookingAnalysis);
adminRouter.get("/peak-demand-visualization", authAdmin, peakDemandVisualization);

// Risk routes
adminRouter.get("/cancellation-risk/:appointmentId", authAdmin, getCancellationRisk);

export default adminRouter;
