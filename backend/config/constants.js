export const REQUIRED_STARTUP_ENV_VARS = [
  "MONGO_URI",
  "JWT_SECRET",
  "CLOUDINARY_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD_HASH",
];

export const TOKEN_EXPIRY = {
  user: process.env.USER_TOKEN_EXPIRY || "7d",
  doctor: process.env.DOCTOR_TOKEN_EXPIRY || "7d",
  admin: process.env.ADMIN_TOKEN_EXPIRY || "1d",
};

export const RATE_LIMITS = {
  apiWindowMs: Number(process.env.API_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  apiMax: Number(process.env.API_RATE_LIMIT_MAX) || 200,
  authWindowMs: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  authMax: Number(process.env.AUTH_RATE_LIMIT_MAX) || 20,
};

export const DEFAULT_ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.trim()
    : "http://localhost:3000",
  process.env.ADMIN_URL
    ? process.env.ADMIN_URL.trim()
    : "http://localhost:5174",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:3000",
];

export const getAllowedOrigins = () => {
  if (process.env.ALLOWED_CORS_ORIGINS) {
    return process.env.ALLOWED_CORS_ORIGINS.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean);
  }

  return DEFAULT_ALLOWED_ORIGINS.filter(Boolean);
};

export const PORT = Number(process.env.PORT) || 8001;

export const MAX_EXPECTED_APPOINTMENTS =
  Number(process.env.MAX_EXPECTED_APPOINTMENTS) || 200;
export const MAX_EXPECTED_REVENUE =
  Number(process.env.MAX_EXPECTED_REVENUE) || 50000;
