import fs from "fs";
import { parsePDF } from "../utils/pdfParser.js";
import { PDFDocument } from 'pdf-lib';
import pdf from 'pdf-parse';
import fsPromises from 'fs/promises';
import path from 'path';

export const analyzePhonePeStatement = async (req, res) => {
  try {
    if (!req.fileUrl) {
      return res.status(400).json({
        success: false,
        message: "No file URL found"
      });
    }

    // Mock data for testing
    const analysis = {
      "statementInfo": {
        "phoneNumber": "8788244416",
        "period": {
          "from": "2025-01-28",
          "to": "2025-02-27"
        }
      },
      "transactions": [
        {
          "date": "2025-02-27",
          "time": "01:37:00",
          "description": "Paid to Pramod Koli (Al ML)",
          "type": "DEBIT",
          "amount": 50,
          "transactionId": "T2502270136589794379823",
          "utrNo": "985036951072",
          "category": "Transfer"
        },
        {
          "date": "2025-02-26",
          "time": "21:49:00",
          "description": "Paid to ENGINEERING COLLEGE CANTEEN",
          "type": "DEBIT",
          "amount": 45,
          "transactionId": "T2502262149165558275989",
          "utrNo": "465449081357",
          "category": "Food"
        },
        {
          "date": "2025-02-25",
          "time": "17:09:00",
          "description": "Paid to Unstop",
          "type": "DEBIT",
          "amount": 255.90,
          "transactionId": "T2502251709414260053914",
          "utrNo": "073577187421",
          "category": "Education"
        }
      ],
      "dailySummary": [
        {
          "date": "2025-02-27",
          "totalCredit": 0,
          "totalDebit": 50,
          "netAmount": -50,
          "transactionCount": 1
        },
        {
          "date": "2025-02-26",
          "totalCredit": 0,
          "totalDebit": 45,
          "netAmount": -45,
          "transactionCount": 1
        },
        {
          "date": "2025-02-25",
          "totalCredit": 0,
          "totalDebit": 255.90,
          "netAmount": -255.90,
          "transactionCount": 1
        }
      ],
      "overview": {
        "totalCredit": 64,
        "totalDebit": 1640.34,
        "netBalance": -1576.34,
        "totalTransactions": 7
      }
    };

    res.json({
      success: true,
      message: "PDF analyzed successfully",
      fileUrl: req.fileUrl,
      analysis: analysis
    });

  } catch (error) {
    console.error("Analysis error:", error);
    res.status(500).json({
      success: false,
      message: "Error analyzing transactions",
      error: error.message
    });
  }
};

export const deletePDFAnalysis = async (req, res) => {
  try {
    const { analysisId } = req.params;
    res.status(200).json({ success: true, message: "PDF analysis deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPDFAnalysis = async (req, res) => {
  try {
    const { analysisId } = req.params;
    res.status(200).json({ 
      success: true, 
      analysis: { id: analysisId, data: "Sample analysis data" } 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
