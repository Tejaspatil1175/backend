import Payment from "../models/paymentModel.js";
import { processPayment } from "../utils/paymentGateway.js";

export const handlePayment = async (req, res) => {
  try {
    const { userId, amount, paymentMethod } = req.body;

    if (!userId || !amount || !paymentMethod) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const paymentResponse = await processPayment(amount, paymentMethod);

    const newPayment = new Payment({
      user: userId,
      amount,
      paymentMethod,
      status: paymentResponse.status,
      transactionId: paymentResponse.transactionId,
    });

    await newPayment.save();

    res.status(200).json({ success: true, message: "Payment successful", payment: newPayment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPaymentHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const payments = await Payment.find({ user: userId });

    res.status(200).json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });

    res.status(200).json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const refundPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });

    // Here you would typically call your payment gateway's refund API
    // For example: await refundPayment(payment.transactionId);

    payment.status = "refunded";
    await payment.save();

    res.status(200).json({ success: true, message: "Payment refunded successfully", payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { paymentId, transactionId } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });

    // Here you would typically call your payment gateway's verification API
    // For example: await verifyPayment(transactionId);

    payment.status = "verified";
    await payment.save();

    res.status(200).json({ success: true, message: "Payment verified successfully", payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
