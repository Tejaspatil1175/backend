import express from "express";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { getProfile, updateProfile } from "../controller/profileController.js";

const router = express.Router();

// Get user profile
router.get("/", isAuthenticated, getProfile);

// Update user profile
router.put("/update", isAuthenticated, updateProfile);

export default router;
