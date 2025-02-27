import mongoose from "mongoose";

const incomeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Please provide income title"],
    },
    amount: {
      type: Number,
      required: [true, "Please provide income amount"],
    },
    category: {
      type: String,
      required: [true, "Please provide income category"],
      enum: ["Salary", "Freelance", "Investment", "Rental", "Business", "Bonus", "Commission", "Others"],
    },
    description: {
      type: String,
      default: "",
    },
    date: {
      type: Date,
      required: [true, "Please provide income date"],
    },
    type: {
      type: String,
      enum: ["one-time", "recurring"],
      default: "one-time",
    },
    paymentMode: {
      type: String,
      enum: ["Cash", "Bank Transfer", "UPI", "Credit Card", "Debit Card", "Cheque", "Others"],
      default: "Cash",
    },
  },
  { timestamps: true }
);

const Income = mongoose.model("Income", incomeSchema);

export default Income;
