import express from "express";
import { getProfile, updateProfile, deleteUserAccount } from "../controller/profileController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", isAuthenticated, getProfile);
router.put("/update", isAuthenticated, updateProfile);
router.delete("/delete", isAuthenticated, deleteUserAccount);

export default router;
