import mongoose from "mongoose";

const loanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lender: {
      type: String,
      required: [true, "Please enter the lender's name"],
    },
    amount: {
      type: Number,
      required: [true, "Please enter the loan amount"],
    },
    interestRate: {
      type: Number,
      required: [true, "Please enter the interest rate"],
    },
    duration: {
      type: Number,
      required: [true, "Please enter the loan duration in months"],
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["ongoing", "completed", "defaulted"],
      default: "ongoing",
    },
  },
  { timestamps: true }
);

const Loan = mongoose.model("Loan", loanSchema);

export default Loan;
