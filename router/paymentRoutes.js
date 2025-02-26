import express from "express";
import { handlePayment, verifyPayment, getPaymentDetails, refundPayment, getPaymentHistory } from "../controller/paymentController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/initiate", isAuthenticated, handlePayment);
router.post("/verify", isAuthenticated, verifyPayment);
router.get("/history", isAuthenticated, getPaymentHistory);

export default router;
