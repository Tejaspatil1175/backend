import Expense from "../models/expenseModel.js";
import User from "../models/userModel.js";

export const addExpense = async (req, res) => {
  try {
    const { 
      title, 
      amount, 
      category, 
      description, 
      date,
      paymentMode 
    } = req.body;

    // Validate required fields
    if (!title || !amount || !category || !date) {
      return res.status(400).json({
        success: false,
        message: "Please provide title, amount, category and date"
      });
    }

    // Create new expense
    const expense = await Expense.create({
      user: req.user.id,
      title,
      amount,
      category,
      description,
      date,
      paymentMode: paymentMode || "Cash"
    });

    // Update user's total expenses
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { expenses: amount }
    });

    res.status(201).json({
      success: true,
      message: "Expense added successfully",
      expense
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding expense",
      error: error.message
    });
  }
};

export const getExpenses = async (req, res) => {
  try {
    const { category, paymentMode, startDate, endDate, sort = '-date' } = req.query;

    // Build query
    const query = { user: req.user.id };

    // Add filters if provided
    if (category) query.category = category;
    if (paymentMode) query.paymentMode = paymentMode;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Get expenses with filters and sorting
    const expenses = await Expense.find(query)
      .sort(sort)
      .select('-__v');

    // Calculate statistics
    const stats = {
      totalExpenses: expenses.reduce((sum, exp) => sum + exp.amount, 0),
      count: expenses.length,
      byCategory: {},
      byPaymentMode: {}
    };

    // Group by category
    expenses.forEach(exp => {
      if (!stats.byCategory[exp.category]) {
        stats.byCategory[exp.category] = {
          count: 0,
          total: 0
        };
      }
      stats.byCategory[exp.category].count++;
      stats.byCategory[exp.category].total += exp.amount;
    });

    // Group by payment mode
    expenses.forEach(exp => {
      if (!stats.byPaymentMode[exp.paymentMode]) {
        stats.byPaymentMode[exp.paymentMode] = {
          count: 0,
          total: 0
        };
      }
      stats.byPaymentMode[exp.paymentMode].count++;
      stats.byPaymentMode[exp.paymentMode].total += exp.amount;
    });

    res.status(200).json({
      success: true,
      stats,
      expenses
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching expenses",
      error: error.message 
    });
  }
};

export const updateExpense = async (req, res) => {
  try {
    const { amount, category, date, description } = req.body;
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    if (expense.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    expense.amount = amount || expense.amount;
    expense.category = category || expense.category;
    expense.date = date || expense.date;
    expense.description = description || expense.description;

    await expense.save();

    res.status(200).json({ success: true, message: "Expense updated successfully", expense });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    if (expense.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await expense.deleteOne();

    res.status(200).json({ success: true, message: "Expense deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
