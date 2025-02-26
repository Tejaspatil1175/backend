import Goal from "../models/goalModel.js";
import { calculateGoalTimeline } from "../utils/aiModel.js";

export const createGoal = async (req, res) => {
  try {
    const { userId, goalName, targetAmount, currentSavings, monthlyContribution } = req.body;

    if (!userId || !goalName || !targetAmount || !currentSavings || !monthlyContribution) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const estimatedTime = calculateGoalTimeline(targetAmount, currentSavings, monthlyContribution);

    const goal = new Goal({
      user: userId,
      goalName,
      targetAmount,
      currentSavings,
      monthlyContribution,
      estimatedTime,
    });

    await goal.save();

    res.status(201).json({ success: true, message: "Goal created successfully", goal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getGoals = async (req, res) => {
  try {
    const { userId } = req.params;

    const goals = await Goal.find({ user: userId });

    res.status(200).json({ success: true, goals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateGoal = async (req, res) => {
  try {
    const { goalId } = req.params;
    const { currentSavings, monthlyContribution } = req.body;

    let goal = await Goal.findById(goalId);

    if (!goal) {
      return res.status(404).json({ success: false, message: "Goal not found" });
    }

    if (currentSavings) goal.currentSavings = currentSavings;
    if (monthlyContribution) goal.monthlyContribution = monthlyContribution;

    goal.estimatedTime = calculateGoalTimeline(goal.targetAmount, goal.currentSavings, goal.monthlyContribution);

    await goal.save();

    res.status(200).json({ success: true, message: "Goal updated successfully", goal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteGoal = async (req, res) => {
  try {
    const { goalId } = req.params;

    const goal = await Goal.findByIdAndDelete(goalId);

    if (!goal) {
      return res.status(404).json({ success: false, message: "Goal not found" });
    }

    res.status(200).json({ success: true, message: "Goal deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addGoal = async (req, res) => {
  try {
    const { userId, goalName, targetAmount, currentSavings, monthlyContribution } = req.body;

    const goal = await Goal.create({
      user: userId,
      goalName,
      targetAmount,
      currentSavings,
      monthlyContribution,
    });

    res.status(201).json({ success: true, goal });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
