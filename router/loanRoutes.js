import express from "express";
import { addLoan, getLoans, updateLoan, deleteLoan, applyLoan } from "../controller/loanController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/apply", isAuthenticated, applyLoan);
router.get("/", isAuthenticated, getLoans);
router.put("/update/:id", isAuthenticated, updateLoan);
router.delete("/delete/:id", isAuthenticated, deleteLoan);

export default router;
