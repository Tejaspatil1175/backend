import { PDFDocument } from 'pdf-lib';

export const parsePDF = async (pdfBuffer) => {
  try {
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pages = pdfDoc.getPages();
    let text = '';

    for (const page of pages) {
      text += page.getTextContent();
    }

    return text;
  } catch (error) {
    throw new Error("Error parsing PDF: " + error.message);
  }
};
