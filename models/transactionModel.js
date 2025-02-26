import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["income", "expense", "loan"],
      required: true,
    },
    amount: {
      type: Number,
      required: [true, "Please enter the transaction amount"],
    },
    category: {
      type: String,
      required: [true, "Please enter the transaction category"],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    description: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
