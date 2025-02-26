import fs from "fs";
import { parsePDF } from "../utils/pdfParser.js";
import { PDFDocument } from 'pdf-lib';
import pdf from 'pdf-parse';
import fsPromises from 'fs/promises';
import path from 'path';

export const analyzePDF = async (req, res) => {
  let filePath = null;
  
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF file"
      });
    }

    filePath = req.file.path;
    console.log('Processing file:', filePath);

    // Read and parse PDF
    const dataBuffer = await fs.promises.readFile(filePath);
    const pdfData = await pdf(dataBuffer);
    const text = pdfData.text;

    // Prepare the OpenRouter request with specific PhonePe format handling
    const openRouterRequest = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'HTTP-Referer': process.env.SITE_URL,
        'X-Title': process.env.SITE_NAME,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek-ai/deepseek-math-7b-base',
        messages: [
          {
            role: 'system',
            content: `Analyze this PhonePe transaction statement and provide a JSON response with:
              {
                "transactions": [
                  {
                    "date": "YYYY-MM-DD",
                    "type": "CREDIT/DEBIT",
                    "amount": number,
                    "description": "string"
                  }
                ],
                "summary": {
                  "totalCredit": number,
                  "totalDebit": number,
                  "netBalance": number
                },
                "categoryAnalysis": {
                  "Food": number,
                  "Education": number,
                  "Others": number
                }
              }`
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.1,
        max_tokens: 1000
      })
    };

    // Call OpenRouter API
    const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', openRouterRequest);
    if (!aiResponse.ok) {
      throw new Error('Failed to analyze PDF');
    }

    const result = await aiResponse.json();
    const analysis = JSON.parse(result.choices[0].message.content);

    // Structure the response with transaction focus
    const response = {
      success: true,
      analysis: {
        transactions: analysis.transactions,
        summary: analysis.summary,
        categoryAnalysis: analysis.categoryAnalysis
      },
      graphs: {
        daily: generateDailyGraph(analysis.transactions),
        categories: generateCategoryGraph(analysis.categoryAnalysis),
        creditDebit: generateCreditDebitGraph(analysis.summary)
      }
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error("PDF Analysis Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error analyzing PDF",
      error: error.message
    });
  } finally {
    if (filePath) {
      try {
        await fs.promises.unlink(filePath);
        console.log('Cleaned up file:', filePath);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }
  }
};

// Helper function to generate daily transaction graph
function generateDailyGraph(transactions) {
  const dates = transactions.map(t => t.date);
  const amounts = transactions.map(t => t.type === 'CREDIT' ? t.amount : -t.amount);

  return {
    labels: dates,
    datasets: [{
      label: 'Daily Transactions',
      data: amounts,
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: amounts.map(amount => 
        amount > 0 ? 'rgba(75, 192, 75, 0.5)' : 'rgba(192, 75, 75, 0.5)'
      ),
      tension: 0.1
    }]
  };
}

// Helper function to generate credit vs debit graph
function generateCreditDebitGraph(summary) {
  return {
    labels: ['Credits', 'Debits'],
    datasets: [{
      label: 'Credit vs Debit',
      data: [summary.totalCredit, summary.totalDebit],
      backgroundColor: [
        'rgba(75, 192, 75, 0.5)',
        'rgba(192, 75, 75, 0.5)'
      ]
    }]
  };
}

// Helper function to generate category-wise spending graph
function generateCategoryGraph(categoryData) {
  return {
    labels: Object.keys(categoryData),
    datasets: [{
      label: 'Category-wise Spending',
      data: Object.values(categoryData),
      backgroundColor: [
        'rgb(255, 99, 132)',
        'rgb(54, 162, 235)',
        'rgb(255, 206, 86)',
        'rgb(75, 192, 192)',
        'rgb(153, 102, 255)'
      ]
    }]
  };
}

export const deletePDFAnalysis = async (req, res) => {
  try {
    const { analysisId } = req.params;

    // Here you would typically delete the analysis record from your database
    // For example: await PDFAnalysis.findByIdAndDelete(analysisId);

    res.status(200).json({ success: true, message: "PDF analysis deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPDFAnalysis = async (req, res) => {
  try {
    const { analysisId } = req.params;

    // Here you would typically fetch the analysis record from your database
    // For example: const analysis = await PDFAnalysis.findById(analysisId);

    // For now, we'll return a placeholder response
    res.status(200).json({ success: true, analysis: { id: analysisId, data: "Sample analysis data" } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
