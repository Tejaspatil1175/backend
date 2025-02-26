import Budget from "../models/budgetModel.js";

export const addBudget = async (req, res) => {
  try {
    const { amount, category } = req.body;
    const userId = req.user.id;

    // Create or update budget
    const budget = await Budget.findOneAndUpdate(
      { user: userId },
      { amount, category },
      { new: true, upsert: true }
    );

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
    const { id } = req.params;

    // Log the budget ID
    console.log("Deleting budget with ID:", id);

    // Log the database query
    console.log("Searching for budget in database...");

    const budget = await Budget.findByIdAndDelete(id);

    if (!budget) {
      console.log("Budget not found in database");
      return res.status(404).json({ success: false, message: "Budget not found" });
    }

    console.log("Budget deleted successfully:", budget);
    res.status(200).json({ success: true, message: "Budget deleted successfully" });
  } catch (error) {
    console.error("Error deleting budget:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateBudget = async (req, res) => {
  try {
    const { budgetId } = req.params;
    const { amount, category } = req.body;

    // Log the budget ID
    console.log("Updating budget with ID:", budgetId);

    // Log the database query
    console.log("Searching for budget in database...");

    const budget = await Budget.findByIdAndUpdate(
      budgetId,
      { amount, category },
      { new: true }
    );

    if (!budget) {
      console.log("Budget not found in database");
      return res.status(404).json({ success: false, message: "Budget not found" });
    }

    console.log("Budget updated successfully:", budget);
    res.status(200).json({ success: true, message: "Budget updated successfully", budget });
  } catch (error) {
    console.error("Error updating budget:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
