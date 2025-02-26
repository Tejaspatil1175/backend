import fs from "fs";
import { parsePDF } from "../utils/pdfParser.js";

export const analyzePDF = async (req, res) => {
  try {
    if (!req.files || !req.files.pdfFile) {
      return res.status(400).json({ message: "No PDF file uploaded" });
    }

    const pdfFile = req.files.pdfFile;
    const filePath = `./uploads/${pdfFile.name}`;

    await pdfFile.mv(filePath);

    const extractedData = await parsePDF(filePath);

    fs.unlinkSync(filePath); // Delete the file after processing

    res.status(200).json({ success: true, data: extractedData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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
