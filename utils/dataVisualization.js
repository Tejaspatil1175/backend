import { ChartJSNodeCanvas } from "chartjs-node-canvas";

const width = 800;
const height = 600;

export const generateFinancialChart = async (labels, data, chartType = "line") => {
  try {
    const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

    const configuration = {
      type: chartType,
      data: {
        labels,
        datasets: [
          {
            label: "Financial Data",
            data,
            backgroundColor: "rgba(54, 162, 235, 0.5)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 2,
          },
        ],
      },
    };

    const image = await chartJSNodeCanvas.renderToBuffer(configuration);
    return image;
  } catch (error) {
    throw new Error("Error generating financial chart: " + error.message);
  }
};
