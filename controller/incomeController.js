import Income from "../models/incomeModel.js";

export const addIncome = async (req, res) => {
  try {
    const { amount, source, date } = req.body;

    if (!amount || !source || !date) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const income = new Income({
      user: req.user.id,
      amount,
      source,
      date,
    });

    await income.save();

    res.status(201).json({ success: true, message: "Income added successfully", income });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getIncomes = async (req, res) => {
  try {
    const incomes = await Income.find({ user: req.user.id }).sort({ date: -1 });

    res.status(200).json({ success: true, incomes });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
