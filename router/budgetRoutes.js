import express from "express";
import { 
  addBudget, 
  getBudgets, 
  updateBudget, 
  deleteBudget, 
  checkBudgetStatus, 
  scanBillAndUpdateBudget 
} from "../controller/budgetController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { upload, handleFileUpload } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.post("/set", isAuthenticated, addBudget);
router.get("/", isAuthenticated, getBudgets);
router.put("/update/:budgetId", isAuthenticated, updateBudget);
router.delete("/delete/:id", isAuthenticated, deleteBudget);
router.post("/status", isAuthenticated, checkBudgetStatus);

// Bill scanning route
router.post("/scan", 
  isAuthenticated,
  upload.single('file'),
  handleFileUpload,
  scanBillAndUpdateBudget
);

// Test upload route
router.post("/test-upload", 
  isAuthenticated,
  upload.single('file'),
  handleFileUpload,
  (req, res) => {
    res.json({
      success: true,
      message: "Upload successful",
      fileUrl: req.fileUrl
    });
  }
);

export default router;
