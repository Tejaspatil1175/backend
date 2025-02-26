import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import path from "path";
import fs from "fs";

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Create an empty PDF file to satisfy pdf-parse initialization
const testPdfPath = path.join('test', 'data', '05-versions-space.pdf');
if (!fs.existsSync(testPdfPath)) {
  fs.writeFileSync(testPdfPath, '%PDF-1.7\n');
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `file-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// Create multer instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Middleware to handle file upload and Cloudinary
const handleFileUpload = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    console.log("File received:", req.file.originalname);

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: 'raw',
      folder: 'pdfs',
      public_id: `pdf-${Date.now()}`,
      timeout: 120000 // 2 minutes
    });

    console.log("Cloudinary upload success:", result.secure_url);

    // Add URL to request object
    req.fileUrl = result.secure_url;

    // Clean up local file
    fs.unlink(req.file.path, (err) => {
      if (err) console.error("Error deleting local file:", err);
    });

    next();
  } catch (error) {
    console.error("Upload error:", error);
    // Clean up local file if it exists
    if (req.file?.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting local file:", err);
      });
    }
    return res.status(500).json({
      success: false,
      message: "Error uploading file",
      error: error.message
    });
  }
};

console.log("Upload middleware configured successfully");

// Export middleware
export { upload, handleFileUpload }; 