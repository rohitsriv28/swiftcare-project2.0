import rateLimit from "express-rate-limit";

/**
 * Rate limiter for authentication endpoints (login, register).
 * Limits to 10 requests per 15-minute window per IP.
 * Prevents brute-force password attacks and registration spam.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    success: false,
    message: "Too many attempts. Please try again after 15 minutes.",
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
});

/**
 * General API rate limiter applied globally.
 * Limits to 100 requests per 15-minute window per IP.
 * Prevents API abuse and DoS attacks.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
