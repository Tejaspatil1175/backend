import Budget from "../models/budgetModel.js";

export const addBudget = async (req, res) => {
  try {
    const { userId, amount, category } = req.body;

    const budget = await Budget.create({
      user: userId,
      amount,
      category,
    });

    res.status(201).json({ success: true, budget });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user.id });
    res.status(200).json({ success: true, budgets });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const checkBudgetStatus = async (req, res) => {
  try {
    const { userId, expense } = req.body;

    const budget = await Budget.findOne({ user: userId });

    if (!budget) {
      return res.status(404).json({ success: false, message: "Budget not set" });
    }

    if (expense > budget.amount) {
      return res.status(400).json({ success: false, message: "Budget limit exceeded" });
    }

    res.status(200).json({ success: true, message: "Within budget" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteBudget = async (req, res) => {
  try {
    const { budgetId } = req.params;

    const budget = await Budget.findByIdAndDelete(budgetId);
    if (!budget) return res.status(404).json({ success: false, message: "Budget not found" });

    res.status(200).json({ success: true, message: "Budget deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateBudget = async (req, res) => {
  try {
    const { budgetId } = req.params;
    const { amount, category } = req.body;

    const budget = await Budget.findByIdAndUpdate(
      budgetId,
      { amount, category },
      { new: true }
    );

    if (!budget) return res.status(404).json({ success: false, message: "Budget not found" });

    res.status(200).json({ success: true, message: "Budget updated successfully", budget });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
