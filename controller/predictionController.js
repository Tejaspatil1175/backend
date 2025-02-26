import Prediction from "../models/predictionModel.js";
import { analyzeFinancialTrends } from "../utils/aiModel.js";

export const getPredictions = async (req, res) => {
  try {
    const { userId } = req.params;

    const predictions = await Prediction.find({ user: userId });

    if (!predictions) {
      return res.status(404).json({ success: false, message: "No predictions found" });
    }

    res.status(200).json({ success: true, predictions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const generateFinancialPrediction = async (req, res) => {
  try {
    const { userId, financialData } = req.body;

    if (!userId || !financialData) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const predictionData = analyzeFinancialTrends(financialData);

    let prediction = await Prediction.findOne({ user: userId });

    if (prediction) {
      prediction.data = predictionData;
    } else {
      prediction = new Prediction({ user: userId, data: predictionData });
    }

    await prediction.save();

    res.status(200).json({ success: true, message: "Prediction generated successfully", prediction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addPrediction = async (req, res) => {
  try {
    const { userId, predictionData } = req.body;

    const prediction = await Prediction.create({
      user: userId,
      data: predictionData,
    });

    res.status(201).json({ success: true, prediction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePrediction = async (req, res) => {
  try {
    const { predictionId } = req.params;

    const prediction = await Prediction.findByIdAndDelete(predictionId);
    if (!prediction) return res.status(404).json({ success: false, message: "Prediction not found" });

    res.status(200).json({ success: true, message: "Prediction deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePrediction = async (req, res) => {
  try {
    const { predictionId } = req.params;
    const { predictionData } = req.body;

    const prediction = await Prediction.findByIdAndUpdate(
      predictionId,
      { data: predictionData },
      { new: true }
    );

    if (!prediction) return res.status(404).json({ success: false, message: "Prediction not found" });

    res.status(200).json({ success: true, message: "Prediction updated successfully", prediction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
