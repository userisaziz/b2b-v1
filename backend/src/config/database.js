import mongoose from "mongoose";
import logger from "../utils/logger.js";

let isConnected = false; // <-- Add this (GLOBAL)

const connectDB = async () => {
  if (isConnected) {
    logger.info("⚡ Using existing MongoDB connection");
    return;
  }

  try {
    logger.info("Attempting MongoDB connection...");

    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI environment variable is not defined");
    }

    const options = {
      autoIndex: process.env.NODE_ENV !== "production",
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      retryReads: true,
    };

    const conn = await mongoose.connect(process.env.MONGO_URI, options);

    isConnected = conn.connections[0].readyState === 1;

    logger.info("✅ MongoDB Connected Successfully");

    mongoose.connection.on("error", err => {
      logger.error("❌ MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      isConnected = false;
      logger.warn("⚠️ MongoDB disconnected");
    });

  } catch (error) {
    logger.error("❌ MongoDB Connection Failed:", error.message || error);
    throw error;
  }
};

export default connectDB;
