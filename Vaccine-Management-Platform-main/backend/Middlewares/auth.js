import User from "../Models/User.js";
import catchAsyncErrors from "./catchAsyncErrors.js";
import ErrorHandler from "./error.js";
import jwt from "jsonwebtoken";
import { isTokenBlacklisted } from "../utils/tokenBlacklist.js";

export const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new ErrorHandler("No token provided. Please log in.", 401));
  }

  const blacklisted = await isTokenBlacklisted(token);
  if (blacklisted) {
    return next(new ErrorHandler("Session has been logged out. Please log in again.", 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  req.user = await User.findById(decoded.id);

  if (!req.user) {
    return next(new ErrorHandler("User not found. Authentication failed.", 401));
  }

  next();
});

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ErrorHandler(`Role (${req.user?.role}) is not authorized to access this resource`, 403));
    }
    next();
  };
};