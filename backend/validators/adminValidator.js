import { body } from "express-validator";

export const adminLoginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Must be a valid email format")
    .normalizeEmail(),
  body("password").trim().notEmpty().withMessage("Password is required"),
];

export const addDoctorValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isString()
    .escape(),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .normalizeEmail(),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
  body("speciality")
    .trim()
    .notEmpty()
    .withMessage("Speciality is required")
    .isString()
    .escape(),
  body("degree")
    .trim()
    .notEmpty()
    .withMessage("Degree is required")
    .isString()
    .escape(),
  body("experience")
    .trim()
    .notEmpty()
    .withMessage("Experience is required")
    .isString()
    .escape(),
  body("about")
    .trim()
    .notEmpty()
    .withMessage("About is required")
    .isString()
    .escape(),
  body("fee")
    .notEmpty()
    .withMessage("Fee is required")
    .isNumeric()
    .withMessage("Fee must be a valid number"),
  body("address")
    .notEmpty()
    .withMessage("Address JSON string is required")
    // Address often comes in as a stringified JSON from FormData, so we validate it is a JSON string
    .custom((value) => {
      try {
         JSON.parse(value);
         return true;
      } catch (e) {
         if (typeof value === "object") return true; 
         throw new Error("Address must be a valid JSON structure");
      }
    }),
];

export const changeAvailabilityValidation = [
  body("docId")
    .trim()
    .notEmpty()
    .withMessage("docId is required")
    .isMongoId()
    .withMessage("Valid docId Mongo ID is required"),
];

export const adminAppointmentCancelValidation = [
  body("appointmentId")
    .trim()
    .notEmpty()
    .withMessage("appointmentId is required")
    .isMongoId()
    .withMessage("Valid appointmentId is required"),
];
