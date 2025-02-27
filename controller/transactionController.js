import Transaction from "../models/transactionModel.js";
import Income from "../models/incomeModel.js";
import Expense from "../models/expenseModel.js";
import User from "../models/userModel.js";

export const addTransaction = async (req, res) => {
  try {
    const { 
      title,
      amount, 
      type, 
      category, 
      description,
      date,
      paymentMode 
    } = req.body;

    // Validate required fields
    if (!title || !amount || !type || !category || !date) {
      return res.status(400).json({
        success: false,
        message: "Please provide title, amount, type, category and date"
      });
    }

    // Validate transaction type
    if (!["income", "expense"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Transaction type must be either 'income' or 'expense'"
      });
    }

    // Create transaction
    const transaction = await Transaction.create({
      user: req.user.id,
      title,
      amount,
      type,
      category,
      description,
      date,
      paymentMode: paymentMode || "Cash"
    });

    // Update user's total income/expense
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { 
        [type === "income" ? "income" : "expenses"]: amount 
      }
    });

    res.status(201).json({
      success: true,
      message: "Transaction added successfully",
      transaction
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding transaction",
      error: error.message
    });
  }
};

export const getTransactions = async (req, res) => {
  try {
    const { startDate, endDate, type, sort = '-date' } = req.query;

    // Build date query
    const dateQuery = {};
    if (startDate || endDate) {
      dateQuery.date = {};
      if (startDate) dateQuery.date.$gte = new Date(startDate);
      if (endDate) dateQuery.date.$lte = new Date(endDate);
    }

    // Get both incomes and expenses
    const [incomes, expenses] = await Promise.all([
      Income.find({ user: req.user.id, ...dateQuery })
        .select('-__v')
        .lean(),
      Expense.find({ user: req.user.id, ...dateQuery })
        .select('-__v')
        .lean()
    ]);

    // Format transactions
    const transactions = [
      ...incomes.map(income => ({
        ...income,
        transactionType: 'income'
      })),
      ...expenses.map(expense => ({
        ...expense,
        transactionType: 'expense'
      }))
    ];

    // Sort transactions
    transactions.sort((a, b) => {
      if (sort === '-date') {
        return new Date(b.date) - new Date(a.date);
      }
      if (sort === 'date') {
        return new Date(a.date) - new Date(b.date);
      }
      if (sort === '-amount') {
        return b.amount - a.amount;
      }
      if (sort === 'amount') {
        return a.amount - b.amount;
      }
      return 0;
    });

    // Filter by type if specified
    const filteredTransactions = type 
      ? transactions.filter(t => t.transactionType === type)
      : transactions;

    // Calculate statistics
    const stats = {
      totalIncome: incomes.reduce((sum, inc) => sum + inc.amount, 0),
      totalExpense: expenses.reduce((sum, exp) => sum + exp.amount, 0),
      netBalance: 0,
      transactionCount: filteredTransactions.length,
      byDate: {}
    };

    stats.netBalance = stats.totalIncome - stats.totalExpense;

    // Group by date
    filteredTransactions.forEach(transaction => {
      const date = transaction.date.toISOString().split('T')[0];
      if (!stats.byDate[date]) {
        stats.byDate[date] = {
          income: 0,
          expense: 0,
          net: 0
        };
      }
      if (transaction.transactionType === 'income') {
        stats.byDate[date].income += transaction.amount;
      } else {
        stats.byDate[date].expense += transaction.amount;
      }
      stats.byDate[date].net = stats.byDate[date].income - stats.byDate[date].expense;
    });

    res.status(200).json({
      success: true,
      stats,
      transactions: filteredTransactions
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching transactions",
      error: error.message
    });
  }
};

export const updateTransaction = async (req, res) => {
  try {
    const { amount, type, category, date, description } = req.body;
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (transaction.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    transaction.amount = amount || transaction.amount;
    transaction.type = type || transaction.type;
    transaction.category = category || transaction.category;
    transaction.date = date || transaction.date;
    transaction.description = description || transaction.description;

    await transaction.save();

    res.status(200).json({ success: true, message: "Transaction updated successfully", transaction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (transaction.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await transaction.deleteOne();

    res.status(200).json({ success: true, message: "Transaction deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
