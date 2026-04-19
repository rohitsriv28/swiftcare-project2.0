import { body } from "express-validator";

export const doctorLoginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Format must be a valid email address")
    .normalizeEmail(),
  body("password").trim().notEmpty().withMessage("Password is required"),
];

export const updateDoctorProfileValidation = [
  body("docId")
    .trim()
    .notEmpty()
    .withMessage("docId is required")
    .isMongoId()
    .withMessage("Valid docId is required"),
  body("fee")
    .optional()
    .isNumeric()
    .withMessage("Fee must be numeric"),
  body("availability")
    .optional()
    .isBoolean()
    .withMessage("Availability must be a boolean"),
  body("about")
    .optional()
    .trim()
    .isString()
    .escape(),
  body("address")
    .optional()
    .custom((value) => {
      try {
        if (typeof value === "string") JSON.parse(value);
        return true;
      } catch (e) {
        if (typeof value === "object") return true;
        throw new Error("Address must be valid JSON");
      }
    }),
];

export const doctorAppointmentValidation = [
  body("appointmentId")
    .trim()
    .notEmpty()
    .withMessage("appointmentId is required")
    .isMongoId()
    .withMessage("Valid appointmentId is required"),
];
