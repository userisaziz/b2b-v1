import mongoose from "mongoose";
import logger from "../utils/logger.js";

const connectDB = async () => {
  try {
    logger.info("Attempting MongoDB connection...");

    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI environment variable is not defined");
    }

    // Recommended Mongoose options (2025 best practices)
    const options = {
      autoIndex: process.env.NODE_ENV !== "production", // disable autoIndex in prod
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    // Extra stability options for production
    if (process.env.NODE_ENV === "production") {
      options.retryWrites = true;
      options.retryReads = true;
      options.directConnection = false;
    }

    await mongoose.connect(process.env.MONGO_URI, options);

    logger.info("✅ MongoDB Connected Successfully");

    // Listeners
    mongoose.connection.on("error", (err) => {
      logger.error("❌ MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("⚠️ MongoDB disconnected");
    });

  } catch (error) {
    logger.error("❌ MongoDB Connection Failed:", error.message || error);
  }
};

export default connectDB;
