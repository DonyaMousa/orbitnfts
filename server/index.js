import express from "express";
import cors from "cors";
import morgan from "morgan";
import { config } from "dotenv";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import { logger } from "./utils/logger.js";
import authRoutes from "./routes/authRoutes.js";
import nftRoutes from "./routes/nftRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import web3Routes from "./routes/web3Routes.js";
import {
  securityMiddleware,
  limiter,
  apiLimiter,
} from "./middleware/securityMiddleware.js";
import { connectDB } from "./config/mongodb.js";

// Process uncaught exceptions and unhandled rejections
process.on("uncaughtException", (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  console.error("UNCAUGHT EXCEPTION! Full error:", err);
  // Don't exit in development mode
  if (process.env.NODE_ENV === "production") {
    process.exit(1);
  }
});

process.on("unhandledRejection", (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  console.error("UNHANDLED REJECTION! Full error:", err);
  // Don't exit in development mode
  if (process.env.NODE_ENV === "production") {
    process.exit(1);
  }
});

// Load environment variables
config();

// Force test mode for all transactions
process.env.USE_TEST_NETWORK = "true";

// Check if we're in test mode
const isTestMode = process.env.USE_TEST_NETWORK === "true";
if (isTestMode) {
  logger.info(
    "Running in TEST MODE with local blockchain. No real transactions will be executed."
  );
}

// Try to import Web3 configuration (with error handling)
let web3Config;
try {
  web3Config = await import("./config/web3.js");
  logger.info("Web3 configuration loaded successfully");
} catch (error) {
  logger.warn(`Web3 configuration error: ${error.message}`);
  logger.info(
    "Continuing without Web3 integration - NFT functionality will be limited"
  );
}

// Connect to MongoDB (mock connection if in test mode)
try {
  await connectDB();
} catch (error) {
  logger.warn(`MongoDB connection error: ${error.message}`);
  logger.info("Continuing with limited database functionality");
}

const app = express();

// Apply security middleware (simplified in test mode)
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Enable pre-flight requests for all routes
app.options("*", cors());

app.use(express.json({ limit: "10mb" }));

// Logging
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/nfts", nftRoutes);
app.use("/api/users", userRoutes);
app.use("/api/web3", web3Routes);

// Root route for health check
app.get("/", (req, res) => {
  res.json({
    status: "API is running",
    mode: isTestMode ? "TEST MODE with local blockchain" : "Production mode",
    web3Status: web3Config ? "Connected" : "Not connected",
    env: process.env.NODE_ENV,
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
    apiUrl: `http://localhost:${process.env.PORT || 5000}`,
  });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Try different ports if the default one is in use
const startServer = async (port = process.env.PORT || 5001) => {
  try {
    const server = app.listen(port, () => {
      logger.info(
        `Server running in ${process.env.NODE_ENV || "development"} mode on port ${port}`
      );
      logger.info(`API available at: http://localhost:${port}`);
      logger.info(
        `Frontend expected at: ${process.env.FRONTEND_URL || "http://localhost:5173"}`
      );
    });

    // Handle server shutdown
    process.on("SIGTERM", () => {
      logger.info("SIGTERM received, shutting down gracefully");
      server.close(() => {
        logger.info("Server closed");
      });
    });

    return server;
  } catch (error) {
    if (error.code === "EADDRINUSE") {
      logger.warn(
        `Port ${port} is already in use, trying port ${Number(port) + 1}`
      );
      return startServer(Number(port) + 1);
    } else {
      logger.error(`Error starting server: ${error.message}`);
      throw error;
    }
  }
};

// Start the server
startServer();

export default app;
