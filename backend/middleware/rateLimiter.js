import rateLimit from "express-rate-limit";
import { RATE_LIMITS } from "../config/constants.js";

/**
 * Rate limiter for authentication endpoints (login, register).
 * Limits to 20 requests per 15-minute window per IP.
 * Prevents brute-force password attacks and registration spam.
 */
export const authLimiter = rateLimit({
  windowMs: RATE_LIMITS.authWindowMs,
  max: RATE_LIMITS.authMax,
  message: {
    success: false,
    message: "Too many attempts. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * General API rate limiter applied globally.
 * Limits to 200 requests per 15-minute window per IP.
 * Prevents API abuse and DoS attacks.
 */
export const apiLimiter = rateLimit({
  windowMs: RATE_LIMITS.apiWindowMs,
  max: RATE_LIMITS.apiMax,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
