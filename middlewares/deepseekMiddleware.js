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
      You are a PhonePe statement analyzer. Parse this statement from URL: ${req.fileUrl}

      The statement contains transactions in this format:
      - Date and Time (e.g., "Feb 27, 2025 01:37 am")
      - Description (e.g., "Paid to Pramod Koli")
      - Type (CREDIT/DEBIT)
      - Amount (e.g., "₹50" or "₹1,003.54")
      - Transaction ID and UTR No.

      Convert the data into this JSON format:
      {
        "statementInfo": {
          "phoneNumber": "string",
          "period": {
            "from": "YYYY-MM-DD",
            "to": "YYYY-MM-DD"
          }
        },
        "transactions": [
          {
            "date": "YYYY-MM-DD",
            "time": "HH:mm:ss",
            "description": "string",
            "type": "CREDIT/DEBIT",
            "amount": number,
            "transactionId": "string",
            "utrNo": "string",
            "category": "Food/Education/Transfer/Other"
          }
        ],
        "dailySummary": [
          {
            "date": "YYYY-MM-DD",
            "totalCredit": number,
            "totalDebit": number,
            "netAmount": number,
            "transactionCount": number
          }
        ],
        "overview": {
          "totalCredit": number,
          "totalDebit": number,
          "netBalance": number,
          "totalTransactions": number
        }
      }

      Rules:
      1. Convert all dates to YYYY-MM-DD format
      2. Convert times to 24-hour format (HH:mm:ss)
      3. Remove ₹ symbol and convert amounts to numbers
      4. Remove commas from numbers
      5. Categorize transactions:
         - "ENGINEERING COLLEGE CANTEEN" -> Food
         - "Unstop", "Swayam NPTEL" -> Education
         - Received/Paid to individuals -> Transfer
         - Others -> Other
      6. Group transactions by date in dailySummary
    `;

    try {
      const response = await fetch("http://127.0.0.1:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "deepseek-r1:1.5b",
          prompt: userText,
          stream: false,
          temperature: 0.1
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
        
        // Basic validation
        if (!parsedAnalysis.transactions || !parsedAnalysis.dailySummary || !parsedAnalysis.overview) {
          throw new Error('Missing required data in analysis');
        }

        req.analysis = parsedAnalysis;
        next();
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        console.error('Attempted to parse:', jsonStr);
        throw new Error('Failed to parse transaction analysis');
      }

    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      throw new Error(`Failed to analyze transactions: ${fetchError.message}`);
    }

  } catch (error) {
    console.error("Analysis error:", error);
    return res.status(500).json({
      success: false,
      message: "Error analyzing transactions",
      error: error.message
    });
  }
}; 