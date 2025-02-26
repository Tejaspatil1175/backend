import mongoose from "mongoose";
import { dbConfig } from "../config/db.js";

const dbConnection = async () => {
  try {
    console.log("Connecting to database...");
    console.log("Database Name:", dbConfig.dbName);
    
    // Log the MongoDB URI (with password masked for security)
    const maskedURI = dbConfig.MONGO_URI.replace(
      /:([^@]+)@/,
      ':****@'
    );
    console.log("MongoDB URI:", maskedURI);
    
    await mongoose.connect(dbConfig.MONGO_URI, {
      dbName: dbConfig.dbName,
    });
    
    console.log("Connected to MongoDB successfully!");
    console.log("Database Host:", mongoose.connection.host);
    console.log("Database Name:", mongoose.connection.name);
  } catch (error) {
    console.error("Database connection error:", error.message);
    console.error("Full error:", error);
    process.exit(1);
  }
};

export { dbConnection };
