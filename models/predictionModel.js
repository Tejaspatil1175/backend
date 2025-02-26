import mongoose from "mongoose";

const predictionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["income", "expense", "savings", "investment"],
      required: true,
    },
    predictedAmount: {
      type: Number,
      required: [true, "Please enter the predicted amount"],
    },
    predictionDate: {
      type: Date,
      default: Date.now,
    },
    accuracy: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Prediction = mongoose.model("Prediction", predictionSchema);

export default Prediction;
