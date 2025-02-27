import Goal from "../models/goalModel.js";

export const addGoal = async (req, res) => {
  try {
    const { 
      title, 
      targetAmount, 
      category, 
      description, 
      deadline,
      priority 
    } = req.body;

    // Validate required fields
    if (!title || !targetAmount || !category || !deadline) {
      return res.status(400).json({
        success: false,
        message: "Please provide title, target amount, category and deadline"
      });
    }

    // Create new goal
    const goal = await Goal.create({
      user: req.user.id,
      title,
      targetAmount,
      category,
      description,
      deadline,
      priority: priority || "Medium"
    });

    res.status(201).json({
      success: true,
      message: "Goal added successfully",
      goal
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding goal",
      error: error.message
    });
  }
};

export const getGoals = async (req, res) => {
  try {
    const { category, priority, status, sort = '-createdAt' } = req.query;

    // Build query
    const query = { user: req.user.id };

    // Add filters if provided
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (status) query.status = status;

    // Get goals with filters and sorting
    const goals = await Goal.find(query)
      .sort(sort)
      .select('-__v');

    // Calculate total target amount and current amount
    const totalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
    const totalCurrent = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);

    res.status(200).json({
      success: true,
      count: goals.length,
      totalTarget,
      totalCurrent,
      progress: ((totalCurrent / totalTarget) * 100).toFixed(2) + '%',
      goals
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching goals",
      error: error.message 
    });
  }
};

export const updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ 
        success: false, 
        message: "Goal not found" 
      });
    }

    if (goal.user.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: "Not authorized" 
      });
    }

    const updatedGoal = await Goal.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Goal updated successfully",
      goal: updatedGoal
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error updating goal",
      error: error.message 
    });
  }
};

export const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ 
        success: false, 
        message: "Goal not found" 
      });
    }

    if (goal.user.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: "Not authorized" 
      });
    }

    await goal.deleteOne();

    res.status(200).json({
      success: true,
      message: "Goal deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error deleting goal",
      error: error.message 
    });
  }
};
