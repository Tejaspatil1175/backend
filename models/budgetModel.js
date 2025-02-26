import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      required: [true, "Please enter the budget category"],
    },
    amount: {
      type: Number,
      required: [true, "Please enter the budget amount"],
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: [true, "Please enter the budget end date"],
    },
    status: {
      type: String,
      enum: ["active", "exceeded", "completed"],
      default: "active",
    },
  },
  { timestamps: true }
);

const Budget = mongoose.model("Budget", budgetSchema);

export default Budget;
