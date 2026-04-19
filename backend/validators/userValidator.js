import { body } from "express-validator";

export const registerValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters")
    .escape(),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Format must be a valid email address")
    .normalizeEmail(),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

export const userLoginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Format must be a valid email address")
    .normalizeEmail(),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required"),
];

export const bookingValidation = [
  body("docId")
    .trim()
    .notEmpty()
    .withMessage("Doctor ID is required")
    .isMongoId()
    .withMessage("Valid docId is required"),
  body("slotDate")
    .trim()
    .notEmpty()
    .withMessage("Slot date is required")
    .matches(/^\d{1,2}_\d{1,2}_\d{4}$/)
    .withMessage("Invalid slot date format (e.g. 15_10_2024)"),
  body("slotTime")
    .trim()
    .notEmpty()
    .withMessage("Slot time is required")
    .matches(/^\d{1,2}:\d{2}\s+(AM|PM)$/)
    .withMessage("Invalid slot time format (e.g. 10:00 AM)"),
];

export const updateProfileValidation = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters")
    .escape(),
  body("phone")
    .optional()
    .trim()
    .isLength({ min: 10, max: 15 })
    .withMessage("Phone must be between 10 and 15 digits"),
  body("dob")
    .optional()
    .trim()
    .isString(),
  body("gender")
    .optional()
    .trim()
    .isString(),    
  body("address")
    .optional()
    .custom((value) => {
      try {
        if (typeof value === "string") JSON.parse(value);
        return true;
      } catch (e) {
        if (typeof value === "object") return true;
        throw new Error("Address payload is invalid");
      }
    }),
];

export const userAppointmentCancelValidation = [
  body("appointmentId")
    .trim()
    .notEmpty()
    .withMessage("appointmentId is required")
    .isMongoId()
    .withMessage("Valid appointmentId is required"),
];

export const razorpayValidation = [
  body("appointmentId")
    .trim()
    .notEmpty()
    .withMessage("appointmentId is required")
    .isMongoId()
    .withMessage("Valid appointmentId is required"),
];

export const verifyRazorpayValidation = [
  body("razorpay_order_id").trim().notEmpty().withMessage("Order ID is required"),
  body("razorpay_payment_id").trim().notEmpty().withMessage("Payment ID is required"),
  body("razorpay_signature").trim().notEmpty().withMessage("Signature is required"),
];

export const khaltiValidation = [
  body("appointmentId")
    .trim()
    .notEmpty()
    .withMessage("appointmentId is required")
    .isMongoId()
    .withMessage("Valid appointmentId is required"),
];

export const verifyKhaltiValidation = [
  body("pidx").trim().notEmpty().withMessage("Payment index is required"),
];
