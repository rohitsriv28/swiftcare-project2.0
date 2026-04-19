import express from "express";
import {
  addDoctor,
  adminDashboarddata,
  adminLogin,
  allAppointments,
  allDoctors,
  appointmentCancellationByAdmin,
} from "../controllers/adminController.js";
import upload from "../middleware/multer.js";
import authAdmin from "../middleware/authAdmin.js";
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

export default adminRouter;
