import express from "express";
import { addExpense, getExpenses, updateExpense, deleteExpense } from "../controller/expenseController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/add", isAuthenticated, addExpense);
router.get("/", isAuthenticated, getExpenses);
router.put("/update/:id", isAuthenticated, updateExpense);
router.delete("/delete/:id", isAuthenticated, deleteExpense);

export default router;
