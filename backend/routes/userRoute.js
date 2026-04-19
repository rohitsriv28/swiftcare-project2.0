import express from "express";
import {
  bookAppointment,
  cancelAppointment,
  getProfile,
  listAppointments,
  registerUser,
  updateProfile,
  userLogin,
} from "../controllers/userController.js";
import authUser from "../middleware/authUser.js";
import upload from "../middleware/multer.js";
import {
  initiateKhaltiPayment,
  payWithRazorpay,
  verifyKhaltiPayment,
  verifyRazorpayPayment,
} from "../controllers/paymentController.js";
import { searchDoctors } from "../controllers/doctorController.js";
import { authLimiter } from "../middleware/rateLimiter.js";

import { validateRequests } from "../validators/validateRequests.js";
import {
  registerValidation,
  userLoginValidation,
  bookingValidation,
  updateProfileValidation,
  userAppointmentCancelValidation,
  razorpayValidation,
  verifyRazorpayValidation,
  khaltiValidation,
  verifyKhaltiValidation
} from "../validators/userValidator.js";

const userRouter = express.Router();

userRouter.post("/register", authLimiter, registerValidation, validateRequests, registerUser);
userRouter.post("/login", authLimiter, userLoginValidation, validateRequests, userLogin);
userRouter.get("/get-profile", authUser, getProfile);
userRouter.post(
  "/update-profile",
  authUser,
  upload.single("image"),
  updateProfileValidation,
  validateRequests,
  updateProfile
);
userRouter.post("/search-doctors", searchDoctors);
userRouter.post("/book-appointment", authUser, bookingValidation, validateRequests, bookAppointment);
userRouter.get("/appointments", authUser, listAppointments);
userRouter.post("/cancel-appointment", authUser, userAppointmentCancelValidation, validateRequests, cancelAppointment);
// Payment routes
userRouter.post("/pay-with-khalti", authUser, khaltiValidation, validateRequests, initiateKhaltiPayment);
userRouter.post("/verify-khalti", authUser, verifyKhaltiValidation, validateRequests, verifyKhaltiPayment);
userRouter.post("/pay-with-razorpay", authUser, razorpayValidation, validateRequests, payWithRazorpay);
userRouter.post("/verify-razorpay", authUser, verifyRazorpayValidation, validateRequests, verifyRazorpayPayment);

export default userRouter;
