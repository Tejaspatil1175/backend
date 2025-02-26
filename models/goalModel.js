import mongoose from "mongoose";

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Please enter the goal title"],
    },
    targetAmount: {
      type: Number,
      required: [true, "Please enter the target amount"],
    },
    savedAmount: {
      type: Number,
      default: 0,
    },
    deadline: {
      type: Date,
      required: [true, "Please enter the goal deadline"],
    },
    status: {
      type: String,
      enum: ["in-progress", "achieved", "failed"],
      default: "in-progress",
    },
  },
  { timestamps: true }
);

const Goal = mongoose.model("Goal", goalSchema);

export default Goal;
