import express from "express";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { upload, handleFileUpload } from "../middlewares/uploadMiddleware.js";
import { analyzePDFWithDeepseek } from "../middlewares/deepseekMiddleware.js";

const router = express.Router();

router.post("/analyze",
  isAuthenticated,
  upload.single('file'),
  handleFileUpload,
  analyzePDFWithDeepseek,
  (req, res) => {
    try {
      const analysis = req.analysis;
      
      res.json({
        success: true,
        message: "PDF analyzed successfully",
        fileUrl: req.fileUrl,
        analysis: analysis
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error in final response",
        error: error.message
      });
    }
  }
);

export default router;
