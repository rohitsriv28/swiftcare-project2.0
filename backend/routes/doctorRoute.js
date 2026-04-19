import express from "express";
import {
  doctorAppointments,
  doctorDashboardData,
  doctorList,
  doctorLogin,
  doctorProfile,
  markAppointmentCancelled,
  markAppointmentCompleted,
  updateDoctorProfile,
} from "../controllers/doctorController.js";
import authDoctor from "../middleware/authDoctor.js";
import multer from "multer";
import { authLimiter } from "../middleware/rateLimiter.js";
import { validateRequests } from "../validators/validateRequests.js";
import { 
  doctorLoginValidation, 
  updateDoctorProfileValidation, 
  doctorAppointmentValidation 
} from "../validators/doctorValidator.js";

const doctorRouter = express.Router();

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } }); // Centralizing memory limits on doctor route exclusively

doctorRouter.get("/list", doctorList);
doctorRouter.post("/login", authLimiter, doctorLoginValidation, validateRequests, doctorLogin);
doctorRouter.get("/doctor-appointments", authDoctor, doctorAppointments);
doctorRouter.post(
  "/complete-appointment",
  authDoctor,
  doctorAppointmentValidation,
  validateRequests,
  markAppointmentCompleted
);
doctorRouter.post("/cancel-appointment", authDoctor, doctorAppointmentValidation, validateRequests, markAppointmentCancelled);
doctorRouter.get("/dashboard", authDoctor, doctorDashboardData);
doctorRouter.post("/profile", authDoctor, doctorProfile);
doctorRouter.post(
  "/update-profile",
  authDoctor,
  upload.single("image"),
  updateDoctorProfileValidation,
  validateRequests,
  updateDoctorProfile
);

export default doctorRouter;
