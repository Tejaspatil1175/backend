import Transaction from "../models/transactionModel.js";

export const addTransaction = async (req, res) => {
  try {
    const { amount, type, category, date, description } = req.body;

    if (!amount || !type || !category || !date) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    const transaction = new Transaction({
      user: req.user.id,
      amount,
      type,
      category,
      date,
      description,
    });

    await transaction.save();

    res.status(201).json({ success: true, message: "Transaction added successfully", transaction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 });

    res.status(200).json({ success: true, transactions });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
