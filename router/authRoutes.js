import express from "express";
import { registerUser, loginUser, logoutUser, getUserDetails } from "../controller/authController.js";
import { isAuthenticated, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Log to confirm registerUser is imported
console.log("Register User Function Imported:", registerUser ? "Success" : "Failed");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", isAuthenticated, logoutUser);
router.get("/me", isAuthenticated, getUserDetails);

// Example: Admin-only route
router.get(
  "/admin",
  isAuthenticated,
  authorizeRoles("admin"),
  (req, res) => {
    res.status(200).json({ success: true, message: "Welcome, Admin!" });
  }
);

// Log to confirm route is set up
console.log("POST /register route set up");

export default router;
