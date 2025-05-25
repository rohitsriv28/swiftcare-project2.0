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
  // payWithEsewa,
  payWithRazorpay,
  // verifyEsewaPayment,
  verifyKhaltiPayment,
  verifyRazorpayPayment,
} from "../controllers/paymentController.js";
import { searchDoctors } from "../controllers/doctorController.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", userLogin);
userRouter.get("/get-profile", authUser, getProfile);
userRouter.post(
  "/update-profile",
  upload.single("image"),
  authUser,
  updateProfile
);
userRouter.post("/search-doctors", authUser, searchDoctors);
userRouter.post("/book-appointment", authUser, bookAppointment);
userRouter.get("/appointments", authUser, listAppointments);
userRouter.post("/cancel-appointment", authUser, cancelAppointment);
// Payment routes
// userRouter.post("/pay-with-esewa", authUser, payWithEsewa);
// userRouter.post("/verify-esewa", authUser, verifyEsewaPayment);
userRouter.post("/pay-with-khalti", authUser, initiateKhaltiPayment);
userRouter.post("/verify-khalti", authUser, verifyKhaltiPayment);
userRouter.post("/pay-with-razorpay", authUser, payWithRazorpay);
userRouter.post("/verify-razorpay", authUser, verifyRazorpayPayment);

export default userRouter;
