import express from "express";
import { addIncome, getIncomes, updateIncome, deleteIncome } from "../controller/incomeController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/add", isAuthenticated, addIncome);
router.get("/", isAuthenticated, getIncomes);
router.put("/update/:id", isAuthenticated, updateIncome);
router.delete("/delete/:id", isAuthenticated, deleteIncome);

export default router;
