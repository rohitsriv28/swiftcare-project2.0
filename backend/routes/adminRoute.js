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
import { changeAvailability } from "../controllers/doctorController.js";

const adminRouter = express.Router();

adminRouter.post("/login", adminLogin);
adminRouter.post("/add-doctor", authAdmin, upload.single("image"), addDoctor);
adminRouter.post("/all-doctors", authAdmin, allDoctors);
adminRouter.post("/change-availability", authAdmin, changeAvailability);
adminRouter.get("/all-appointments", authAdmin, allAppointments);
adminRouter.post(
  "/cancel-appointment",
  authAdmin,
  appointmentCancellationByAdmin
);
adminRouter.get("/dashboard", authAdmin, adminDashboarddata);

export default adminRouter;
