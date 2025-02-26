import express from "express";
import { addBudget, getBudgets, updateBudget, deleteBudget, checkBudgetStatus } from "../controller/budgetController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/set", isAuthenticated, addBudget);
router.get("/", isAuthenticated, getBudgets);
router.put("/update/:id", isAuthenticated, updateBudget);
router.delete("/delete/:id", isAuthenticated, deleteBudget);
router.get("/status", isAuthenticated, checkBudgetStatus);

export default router;
