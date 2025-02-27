import express from "express";
import { getPredictions, addPrediction, updatePrediction, deletePrediction, generateFinancialPrediction, getStockData, generateStockPrediction } from "../controller/predictionController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Get real-time stock data
router.get("/stock", isAuthenticated, getStockData);

// Get stock prediction
router.get("/stock/predict", isAuthenticated, generateStockPrediction);

router.post("/predict", isAuthenticated, generateFinancialPrediction);

export default router;
