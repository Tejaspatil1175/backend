import { createWorker } from 'tesseract.js';
import sharp from 'sharp';

// Export as default instead of named export
const scanReceipt = async (imageBuffer) => {
  try {
    // Process image for better OCR
    const processedImage = await sharp(imageBuffer)
      .grayscale()
      .normalize()
      .sharpen()
      .toBuffer();

    // Initialize Tesseract worker
    const worker = await createWorker();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');

    // Perform OCR
    const { data: { text } } = await worker.recognize(processedImage);
    await worker.terminate();

    // Parse receipt text
    const lines = text.split('\n').filter(line => line.trim());
    
    // Extract data
    const receiptData = {
      vendor: extractVendor(lines),
      date: extractDate(lines),
      total: extractTotal(lines),
      items: extractItems(lines)
    };

    return receiptData;

  } catch (error) {
    console.error('Receipt scanning error:', error);
    throw new Error('Failed to scan receipt');
  }
};

// Helper functions
function extractVendor(lines) {
  // Usually the vendor name is at the top of the receipt
  return lines[0]?.trim() || 'Unknown Vendor';
}

function extractDate(lines) {
  // Look for date patterns in lines
  const datePattern = /\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|\d{2,4}[-/]\d{1,2}[-/]\d{1,2}/;
  for (const line of lines) {
    const match = line.match(datePattern);
    if (match) return new Date(match[0]);
  }
  return new Date();
}

function extractTotal(lines) {
  // Look for total amount patterns
  const totalPattern = /total[:\s]*(?:rs\.?|₹)?\s*(\d+(?:\.\d{2})?)/i;
  for (const line of lines.reverse()) { // Start from bottom
    const match = line.match(totalPattern);
    if (match) return parseFloat(match[1]);
  }
  return 0;
}

function extractItems(lines) {
  const items = [];
  let isItemSection = false;

  for (const line of lines) {
    // Skip headers and totals
    if (line.toLowerCase().includes('total') || 
        line.toLowerCase().includes('subtotal') ||
        line.toLowerCase().includes('tax')) {
      continue;
    }

    // Look for item patterns (usually has a price)
    const pricePattern = /(?:rs\.?|₹)?\s*(\d+(?:\.\d{2})?)/;
    if (pricePattern.test(line)) {
      const itemName = line.replace(pricePattern, '').trim();
      if (itemName) items.push(itemName);
    }
  }

  return items;
}

// Export all functions that might be needed elsewhere
export {
  scanReceipt,
  extractVendor,
  extractDate,
  extractTotal,
  extractItems
}; 