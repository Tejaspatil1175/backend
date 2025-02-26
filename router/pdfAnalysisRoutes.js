import express from "express";
import { analyzePDF, getPDFAnalysis, deletePDFAnalysis } from "../controller/pdfAnalysisController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.post("/analyze", isAuthenticated, upload.single("file"), analyzePDF);

export default router;
