import express from "express";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { 
  addGoal, 
  getGoals, 
  updateGoal, 
  deleteGoal 
} from "../controller/goalController.js";

const router = express.Router();

router.post("/set", isAuthenticated, addGoal);
router.get("/", isAuthenticated, getGoals);
router.put("/:id", isAuthenticated, updateGoal);
router.delete("/:id", isAuthenticated, deleteGoal);

export default router;
