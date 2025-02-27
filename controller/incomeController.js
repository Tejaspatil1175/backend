import Income from "../models/incomeModel.js";
import User from "../models/userModel.js";

export const addIncome = async (req, res) => {
  try {
    const { title, amount, category, description, date, type, paymentMode } = req.body;

    // Validate required fields
    if (!title || !amount || !category || !date) {
      return res.status(400).json({
        success: false,
        message: "Please provide title, amount, category and date"
      });
    }

    // Create new income
    const income = await Income.create({
      user: req.user.id,
      title,
      amount,
      category,
      description,
      date,
      type: type || 'one-time',
      paymentMode: paymentMode || 'Cash'
    });

    // Update user's total income
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { income: amount }
    });

    res.status(201).json({
      success: true,
      message: "Income added successfully",
      income
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding income",
      error: error.message
    });
  }
};

export const getIncomes = async (req, res) => {
  try {
    const { category, type, startDate, endDate, sort = '-date' } = req.query;

    // Build query
    const query = { user: req.user.id };

    // Add filters if provided
    if (category) query.category = category;
    if (type) query.type = type;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Get incomes with filters and sorting
    const incomes = await Income.find(query)
      .sort(sort)
      .select('-__v');

    // Calculate total
    const total = incomes.reduce((sum, income) => sum + income.amount, 0);

    res.status(200).json({
      success: true,
      count: incomes.length,
      total,
      incomes
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching incomes",
      error: error.message
    });
  }
};

export const updateIncome = async (req, res) => {
  try {
    const { amount, source, date } = req.body;
    const income = await Income.findById(req.params.id);

    if (!income) {
      return res.status(404).json({ message: "Income not found" });
    }

    if (income.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    income.amount = amount || income.amount;
    income.source = source || income.source;
    income.date = date || income.date;

    await income.save();

    res.status(200).json({ success: true, message: "Income updated successfully", income });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteIncome = async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);

    if (!income) {
      return res.status(404).json({ message: "Income not found" });
    }

    if (income.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await income.deleteOne();

    res.status(200).json({ success: true, message: "Income deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
