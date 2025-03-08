import mongoose from "mongoose";
import { config } from "dotenv";
import { logger } from "../utils/logger.js";

config();

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://donyamousa:$orbitnfts@orbitnfts.0gtw2.mongodb.net/?retryWrites=true&w=majority&appName=orbitnfts";

// Connect to MongoDB
export const connectDB = async () => {
  // If using test network, we'll use a local database
  if (process.env.USE_TEST_NETWORK === "true") {
    logger.info("Using local database for testing");

    try {
      const conn = await mongoose.connect(MONGODB_URI);

      logger.info(`MongoDB connected: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      logger.error(`MongoDB connection error: ${error.message}`);
      process.exit(1);
    }
  }

  try {
    // Connect to MongoDB
    const conn = await mongoose.connect(MONGODB_URI);

    logger.info(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

// Disconnect from MongoDB (useful for testing and graceful shutdown)
export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    logger.info("MongoDB disconnected");
  } catch (error) {
    logger.error(`Error disconnecting from MongoDB: ${error.message}`);
  }
};

export default { connectDB, disconnectDB };
