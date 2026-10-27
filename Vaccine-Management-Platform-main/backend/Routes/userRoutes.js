import express from "express";
import { isAuthenticated } from "../Middlewares/auth.js";
import { loginLimiter, registerLimiter } from "../Middlewares/rateLimiters.js";
import {
  createUser,
  editUserProfile,
  deleteUser,
  loginUser,
  logoutUser,
  getCurrentUser
} from "../Controllers/User.js";

const router = express.Router();

// register a new user 
router.post("/", registerLimiter, createUser);

//  login 
router.post("/login", loginLimiter, loginUser);

//logout 
router.post("/logout", logoutUser);

//  get the currently logged-in user profile 
router.get("/me", isAuthenticated, getCurrentUser);

//  edit a user profile 
router.put("/", isAuthenticated, editUserProfile);

//  delete a user
router.delete("/", isAuthenticated, deleteUser);

export default router;