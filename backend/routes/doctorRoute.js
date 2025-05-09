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

const doctorRouter = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

doctorRouter.get("/list", doctorList);
doctorRouter.post("/login", doctorLogin);
doctorRouter.get("/doctor-appointments", authDoctor, doctorAppointments);
doctorRouter.post(
  "/complete-appointment",
  authDoctor,
  markAppointmentCompleted
);
doctorRouter.post("/cancel-appointment", authDoctor, markAppointmentCancelled);
doctorRouter.get("/dashboard", authDoctor, doctorDashboardData);
doctorRouter.get("/profile", authDoctor, doctorProfile);
doctorRouter.post(
  "/update-profile",
  authDoctor,
  upload.single("image"),
  updateDoctorProfile
);

export default doctorRouter;
