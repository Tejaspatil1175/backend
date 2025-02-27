import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: [true, "Please enter expense title"],
  },
  amount: {
    type: Number,
    required: [true, "Please enter expense amount"],
  },
  category: {
    type: String,
    required: [true, "Please select a category"],
    enum: ["Food", "Transportation", "Housing", "Utilities", "Healthcare", "Education", "Entertainment", "Shopping", "Others"],
  },
  description: {
    type: String,
    default: "",
  },
  date: {
    type: Date,
    required: [true, "Please enter expense date"],
  },
  paymentMode: {
    type: String,
    enum: ["Cash", "Bank Transfer", "UPI", "Credit Card", "Debit Card", "Others"],
    default: "Cash",
  }
}, { timestamps: true });

export default mongoose.model("Expense", expenseSchema);
