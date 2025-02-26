import multer from 'multer';

export const errorHandler = (err, req, res, next) => {
  console.error("\n=== Error Handler ===");
  console.error("Error:", err);
  console.error("Stack:", err.stack);
  
  if (err instanceof multer.MulterError) {
    console.log("Multer error detected");
    return res.status(400).json({
      success: false,
      message: "File upload error",
      error: err.message
    });
  }

  res.status(500).json({
    success: false,
    message: "Server error",
    error: err.message
  });
};
    