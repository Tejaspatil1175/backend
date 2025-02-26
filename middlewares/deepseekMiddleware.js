import fetch from 'node-fetch';  // Add this import if not already present

// Helper function to check if Ollama is running
const checkOllamaStatus = async () => {
  try {
    const response = await fetch("http://127.0.0.1:11434/api/version");
    return response.ok;
  } catch (error) {
    return false;
  }
};

// Analyze PDF with local Deepseek
export const analyzePDFWithDeepseek = async (req, res, next) => {
  try {
    if (!req.fileUrl) {
      return res.status(400).json({
        success: false,
        message: "No file URL found"
      });
    }

    console.log('Making request to local Deepseek with URL:', req.fileUrl);

    const userText = `
      Analyze all charts and graphs in this PDF from URL: ${req.fileUrl}

      For each chart/graph found, identify:
      1. Chart type (pie chart, bar graph, line graph, etc.)
      2. Categories and their values
      3. Percentages or proportions
      4. Labels and legends
      5. Any trends or patterns

      Return the data in this JSON format:
      {
        "charts": [
          {
            "type": "pie_chart/bar_graph/line_graph",
            "title": "string",
            "categories": [
              {
                "label": "string",
                "value": number,
                "percentage": number,
                "color": "string (if available)"
              }
            ],
            "total": number,
            "insights": {
              "largestSegment": "string",
              "smallestSegment": "string",
              "significantPatterns": ["string"]
            }
          }
        ],
        "timeBasedData": {
          "period": "daily/monthly/yearly",
          "dataPoints": [
            {
              "date": "YYYY-MM-DD",
              "value": number,
              "category": "string"
            }
          ],
          "trends": {
            "highestValue": number,
            "lowestValue": number,
            "averageValue": number,
            "trend": "increasing/decreasing/stable"
          }
        },
        "summary": {
          "totalCharts": number,
          "mainInsights": ["string"],
          "recommendations": ["string"]
        }
      }

      IMPORTANT: 
      1. Return only valid JSON
      2. Include all visible data points
      3. Calculate percentages for pie charts
      4. Identify patterns and trends
      5. Extract all labels and values accurately
    `;

    try {
      const response = await fetch("http://127.0.0.1:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "deepseek-r1:1.5b",
          prompt: userText,
          stream: false,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Raw Deepseek Response:", data.response);

      if (!data || !data.response) {
        throw new Error('No response from Deepseek');
      }

      // Extract JSON from response
      let jsonStr = data.response;
      const firstBrace = jsonStr.indexOf('{');
      const lastBrace = jsonStr.lastIndexOf('}');
      
      if (firstBrace === -1 || lastBrace === -1) {
        throw new Error('No valid JSON found in response');
      }

      jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);

      try {
        const parsedAnalysis = JSON.parse(jsonStr);
        
        // Validate the structure
        if (!parsedAnalysis.charts && !parsedAnalysis.timeBasedData) {
          throw new Error('Invalid chart analysis structure');
        }

        req.analysis = parsedAnalysis;
        next();
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        console.error('Attempted to parse:', jsonStr);
        throw new Error('Failed to parse chart analysis results');
      }

    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      throw new Error(`Failed to analyze charts: ${fetchError.message}`);
    }

  } catch (error) {
    console.error("Analysis error:", error);
    return res.status(500).json({
      success: false,
      message: "Error analyzing charts in PDF",
      error: error.message
    });
  }
}; 