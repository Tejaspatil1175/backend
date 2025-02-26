import express from "express";
import { getPredictions, addPrediction, updatePrediction, deletePrediction, generateFinancialPrediction } from "../controller/predictionController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/predict", isAuthenticated, generateFinancialPrediction);

export default router;
