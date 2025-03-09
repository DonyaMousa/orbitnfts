import express from "express";
import cors from "cors";
import morgan from "morgan";
import { config } from "dotenv";
import { createServer } from "http";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import { logger } from "./utils/logger.js";
import authRoutes from "./routes/authRoutes.js";
import nftRoutes from "./routes/nftRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import web3Routes from "./routes/web3Routes.js";
import blogRoutes from "./routes/blogRoutes.js";
import { initializeSocketIO } from "./services/socketService.js";
import {
  securityMiddleware,
  limiter,
  apiLimiter,
} from "./middleware/securityMiddleware.js";
import { connectDB } from "./config/mongodb.js";
import jwt from "jsonwebtoken";

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

// Force test mode for all transactions in development
if (process.env.NODE_ENV !== "production") {
  process.env.USE_TEST_NETWORK = "true";

  // Set default blog contract addresses for testing if not provided
  if (!process.env.BLOG_POST_CONTRACT_ADDRESS) {
    process.env.BLOG_POST_CONTRACT_ADDRESS =
      "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    logger.info(
      `Using default BlogPost contract address: ${process.env.BLOG_POST_CONTRACT_ADDRESS}`
    );
  }

  if (!process.env.BLOG_COMMENT_CONTRACT_ADDRESS) {
    process.env.BLOG_COMMENT_CONTRACT_ADDRESS =
      "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
    logger.info(
      `Using default BlogComment contract address: ${process.env.BLOG_COMMENT_CONTRACT_ADDRESS}`
    );
  }

  // Set default JWT secret for development
  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = "development_jwt_secret_key";
    logger.info("Using default JWT secret for development");
  }

  // Set default server private key for development
  if (!process.env.SERVER_PRIVATE_KEY) {
    // This is a development private key, NEVER use in production
    process.env.SERVER_PRIVATE_KEY =
      "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
    logger.info("Using default server private key for development");
  }
}

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
const httpServer = createServer(app);

// Initialize Socket.IO
try {
  initializeSocketIO(httpServer);
  logger.info("Socket.IO initialized successfully");
} catch (error) {
  logger.warn(`Socket.IO initialization error: ${error.message}`);
  logger.info("Continuing without real-time functionality");
}

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
app.use("/api/blog", blogRoutes);

// Development route for testing authentication
if (process.env.NODE_ENV !== "production") {
  app.get("/api/test-auth", (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        error: "No token provided",
      });
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "development_jwt_secret_key"
      );
      return res.status(200).json({
        success: true,
        user: decoded,
        message: "Token is valid",
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: "Invalid token: " + error.message,
      });
    }
  });
}

// Root route for health check
app.get("/", (req, res) => {
  res.json({
    status: "API is running",
    mode: isTestMode ? "TEST MODE with local blockchain" : "Production mode",
    web3Status: web3Config ? "Connected" : "Not connected",
    env: process.env.NODE_ENV,
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
    apiUrl: `http://localhost:${process.env.PORT || 5001}`,
    auth: {
      testToken: `${process.env.NODE_ENV !== "production" ? "http://localhost:" + process.env.PORT || 5001 + "/api/auth/test-token" : "Not available in production"}`,
    },
  });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Try different ports if the default one is in use
const startServer = async (port = process.env.PORT || 5001) => {
  try {
    const server = httpServer.listen(port, () => {
      logger.info(
        `Server running in ${process.env.NODE_ENV || "development"} mode on port ${port}`
      );
      logger.info(`API available at: http://localhost:${port}`);
      logger.info(
        `Frontend expected at: ${process.env.FRONTEND_URL || "http://localhost:5173"}`
      );
      logger.info("Socket.IO initialized for real-time updates");

      if (process.env.NODE_ENV !== "production") {
        logger.info(
          "Test token available at: http://localhost:" +
            port +
            "/api/auth/test-token (POST)"
        );
      }
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
