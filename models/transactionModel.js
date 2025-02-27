import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: [true, "Please enter transaction title"],
  },
  amount: {
    type: Number,
    required: [true, "Please enter amount"],
  },
  type: {
    type: String,
    required: [true, "Please specify transaction type"],
    enum: ["income", "expense"],
  },
  category: {
    type: String,
    required: [true, "Please select a category"],
    // Categories based on type
    validate: {
      validator: function(category) {
        const incomeCategories = ["Salary", "Freelance", "Investment", "Rental", "Business", "Others"];
        const expenseCategories = ["Food", "Transportation", "Housing", "Utilities", "Healthcare", "Education", "Entertainment", "Shopping", "Others"];
        return this.type === "income" 
          ? incomeCategories.includes(category)
          : expenseCategories.includes(category);
      },
      message: "Invalid category for transaction type"
    }
  },
  description: {
    type: String,
    default: "",
  },
  date: {
    type: Date,
    required: [true, "Please enter transaction date"],
  },
  paymentMode: {
    type: String,
    enum: ["Cash", "Bank Transfer", "UPI", "Credit Card", "Debit Card", "Others"],
    default: "Cash",
  }
}, { timestamps: true });

export default mongoose.model("Transaction", transactionSchema);
