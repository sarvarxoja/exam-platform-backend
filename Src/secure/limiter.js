import rateLimit from "express-rate-limit";

export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, //15 daqiqada 5 ta request
  message: "Too many requests, please try again later.",
  statusCode: 429,
});
