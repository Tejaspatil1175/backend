import express from "express";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { errorHandler } from "./middlewares/errorMiddleware.js";
import { dbConfig } from "./config/db.js";
import { dbConnection } from "./database/dbConnection.js";

// Import Routes
import authRoutes from './router/authRoutes.js';
import profileRoutes from "./router/profileRoutes.js";
import incomeRoutes from "./router/incomeRoutes.js";
import expenseRoutes from "./router/expenseRoutes.js";
import loanRoutes from "./router/loanRoutes.js";
import transactionRoutes from "./router/transactionRoutes.js";
import budgetRoutes from "./router/budgetRoutes.js";
import predictionRoutes from "./router/predictionRoutes.js";
import goalRoutes from "./router/goalRoutes.js";
import pdfAnalysisRoutes from "./router/pdfAnalysisRoutes.js";
import paymentRoutes from "./router/paymentRoutes.js";

// Load env vars first
config({ path: "./config/config.env" });

// Create the express app
const app = express();

// Middleware
app.use(
  cors({
    origin: [process.env.FRONTEND_URL, process.env.DASHBOARD_URL],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log to confirm authRoutes are imported
console.log("Auth Routes Imported:", authRoutes ? "Success" : "Failed");

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/income", incomeRoutes);
app.use("/api/v1/expense", expenseRoutes);
app.use("/api/v1/loan", loanRoutes);
app.use("/api/v1/transaction", transactionRoutes);
app.use("/api/v1/budget", budgetRoutes);
app.use("/api/v1/prediction", predictionRoutes);
app.use("/api/v1/goal", goalRoutes);
app.use("/api/v1/pdf", pdfAnalysisRoutes);
app.use("/api/v1/payment", paymentRoutes);

// Log to confirm authRoutes are mounted
console.log("Auth Routes Mounted at /api/auth");

// Database Connection
dbConnection();

// Error Middleware
app.use(errorHandler);

// Export the app
export default app;
