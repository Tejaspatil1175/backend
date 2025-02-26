import express from "express";
import { registerUser, loginUser, logoutUser, getUserDetails } from "../controller/authController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Log to confirm registerUser is imported
console.log("Register User Function Imported:", registerUser ? "Success" : "Failed");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", isAuthenticated, logoutUser);
router.get("/me", isAuthenticated, getUserDetails);

// Log to confirm route is set up
console.log("POST /register route set up");

export default router;
