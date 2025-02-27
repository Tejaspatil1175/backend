import mongoose from "mongoose";

const goalSchema = new mongoose.Schema({
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
  currentAmount: {
    type: Number,
    default: 0,
  },
  category: {
    type: String,
    required: [true, "Please select a category"],
    enum: ["Savings", "Investment", "Education", "Property", "Vehicle", "Travel", "Others"],
  },
  description: {
    type: String,
    default: "",
  },
  deadline: {
    type: Date,
    required: [true, "Please enter the goal deadline"],
  },
  status: {
    type: String,
    enum: ["In Progress", "Completed", "Failed"],
    default: "In Progress",
  },
  priority: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Medium",
  }
}, { timestamps: true });

const Goal = mongoose.model("Goal", goalSchema);

export default Goal;
