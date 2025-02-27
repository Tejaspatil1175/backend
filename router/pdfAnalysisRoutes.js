import express from "express";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { upload, handleFileUpload } from "../middlewares/uploadMiddleware.js";
import { analyzePhonePeStatement } from "../controller/pdfAnalysisController.js";

const router = express.Router();

router.post("/analyze",
  isAuthenticated,
  upload.single('file'),
  handleFileUpload,
  analyzePhonePeStatement
);

export default router;
