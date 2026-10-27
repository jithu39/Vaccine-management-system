import User from "../Models/User.js";
import { sendToken } from "../utils/jwtToken.js";
import catchAsyncErrors from "../Middlewares/catchAsyncErrors.js";
import ErrorHandler from "../Middlewares/error.js";
import jwt from "jsonwebtoken";
import { blacklistToken } from "../utils/tokenBlacklist.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Create a new user 
export const createUser = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password, mobile } = req.body;

  if (!name || !email || !password || !mobile) {
    return next(new ErrorHandler("Name, email, password and mobile are required", 400));
  }
  if (!EMAIL_REGEX.test(email)) {
    return next(new ErrorHandler("Invalid email format", 400));
  }
  if (password.length < 8) {
    return next(new ErrorHandler("Password must be at least 8 characters", 400));
  }

  
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ErrorHandler("User already exists", 400));
  }

  
  const newUser = new User({ name, email, password, mobile, role: "resident" });
  await newUser.save();

  sendToken(newUser, 201, res, "User created successfully");
});

// User login
export const loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Email and password are required", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  sendToken(user, 200, res, "Login successful");
});

// User logout
export const logoutUser = catchAsyncErrors(async (req, res) => {
  const { token } = req.cookies;

  if (token) {
    try {
      const decoded = jwt.decode(token);
      if (decoded?.exp) {
        await blacklistToken(token, decoded.exp);
      }
    } catch (e) {
      
    }
  }

  res.cookie("token", "", { expires: new Date(0), httpOnly: true });
  res.status(200).json({ success: true, message: "Logout successful" });
});

// Get currently logged-in user profile 
export const getCurrentUser = catchAsyncErrors(async (req, res) => {
  // req.user is already populated by the isAuthenticated middleware
  res.status(200).json({ success: true, user: req.user });
});

// Edit user profile 
export const editUserProfile = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) return next(new ErrorHandler("User not found", 404));

  const { name, email, password, mobile } = req.body;
  if (email && !EMAIL_REGEX.test(email)) {
    return next(new ErrorHandler("Invalid email format", 400));
  }
  if (password && password.length < 8) {
    return next(new ErrorHandler("Password must be at least 8 characters", 400));
  }

  if (name) user.name = name;
  if (email) user.email = email;
  if (mobile) user.mobile = mobile;
  if (password) user.password = password; 

  await user.save();

  sendToken(user, 200, res, "User profile updated successfully");
});

// Delete user 
export const deleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) return next(new ErrorHandler("User not found", 404));

  await user.deleteOne();

  const { token } = req.cookies;
  if (token) {
    try {
      const decoded = jwt.decode(token);
      if (decoded?.exp) {
        await blacklistToken(token, decoded.exp);
      }
    } catch (e) {
      // Malformed token — nothing to blacklist
    }
  }

  res.cookie("token", "", {
  expires: new Date(0),
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
});

  res.status(200).json({ success: true, message: "User deleted and logged out successfully" });
});