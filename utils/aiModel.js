import * as tf from "@tensorflow/tfjs";

export const analyzeFinancialTrends = async (historicalData) => {
  try {
    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 10, inputShape: [historicalData[0].length], activation: "relu" }));
    model.add(tf.layers.dense({ units: 1 }));

    model.compile({ optimizer: "adam", loss: "meanSquaredError" });

    const xs = tf.tensor2d(historicalData.map((data) => data.slice(0, -1)));
    const ys = tf.tensor2d(historicalData.map((data) => [data[data.length - 1]]));

    await model.fit(xs, ys, { epochs: 50 });

    const prediction = model.predict(xs).arraySync();

    return prediction;
  } catch (error) {
    throw new Error("AI Prediction Error: " + error.message);
  }
};

export const calculateGoalTimeline = (goalAmount, currentSavings, monthlyContribution) => {
  try {
    if (monthlyContribution <= 0) {
      throw new Error("Monthly contribution must be greater than 0");
    }

    const remainingAmount = goalAmount - currentSavings;
    const monthsRequired = Math.ceil(remainingAmount / monthlyContribution);

    return {
      monthsRequired,
      targetDate: new Date(new Date().setMonth(new Date().getMonth() + monthsRequired)),
    };
  } catch (error) {
    throw new Error("Goal timeline calculation error: " + error.message);
  }
};
