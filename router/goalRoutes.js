import express from "express";
import { addGoal, getGoals, updateGoal, deleteGoal } from "../controller/goalController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/set", isAuthenticated, addGoal);
router.get("/", isAuthenticated, getGoals);
router.put("/update/:id", isAuthenticated, updateGoal);
router.delete("/delete/:id", isAuthenticated, deleteGoal);

export default router;
