import Loan from "../models/loanModel.js";

export const addLoan = async (req, res) => {
  try {
    const { amount, lender, interestRate, startDate, endDate, status } = req.body;

    if (!amount || !lender || !interestRate || !startDate || !endDate || !status) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const loan = new Loan({
      user: req.user.id,
      amount,
      lender,
      interestRate,
      startDate,
      endDate,
      status,
    });

    await loan.save();

    res.status(201).json({ success: true, message: "Loan added successfully", loan });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getLoans = async (req, res) => {
  try {
    const loans = await Loan.find({ user: req.user.id }).sort({ startDate: -1 });

    res.status(200).json({ success: true, loans });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateLoan = async (req, res) => {
  try {
    const { amount, lender, interestRate, startDate, endDate, status } = req.body;
    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    if (loan.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    loan.amount = amount || loan.amount;
    loan.lender = lender || loan.lender;
    loan.interestRate = interestRate || loan.interestRate;
    loan.startDate = startDate || loan.startDate;
    loan.endDate = endDate || loan.endDate;
    loan.status = status || loan.status;

    await loan.save();

    res.status(200).json({ success: true, message: "Loan updated successfully", loan });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteLoan = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    if (loan.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await loan.deleteOne();

    res.status(200).json({ success: true, message: "Loan deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const applyLoan = async (req, res) => {
  try {
    const { userId, amount, duration, interestRate } = req.body;

    // Validate input
    if (!userId || !amount || !duration || !interestRate) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Create new loan
    const loan = await Loan.create({
      user: userId,
      amount,
      duration,
      interestRate,
      status: "pending",
    });

    res.status(201).json({ success: true, message: "Loan application submitted", loan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
