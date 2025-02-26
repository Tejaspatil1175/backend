import express from "express";
import { getTransactions, addTransaction, updateTransaction, deleteTransaction } from "../controller/transactionController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", isAuthenticated, getTransactions);
router.post("/add", isAuthenticated, addTransaction);
router.delete("/delete/:id", isAuthenticated, deleteTransaction);

export default router;
