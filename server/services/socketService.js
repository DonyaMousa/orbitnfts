import { Server } from "socket.io";
import { logger } from "../utils/logger.js";
import jwt from "jsonwebtoken";

let io;

/**
 * Initialize Socket.IO with the HTTP server
 * @param {Object} server - HTTP server instance
 */
export const initializeSocketIO = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Authentication error: Token not provided"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (error) {
      logger.error(`Socket authentication error: ${error.message}`);
      return next(new Error("Authentication error: Invalid token"));
    }
  });

  // Connection handler
  io.on("connection", (socket) => {
    logger.info(`User connected: ${socket.id}, user: ${socket.user?.userId}`);

    // Join user to their own room for personalized events
    if (socket.user?.userId) {
      socket.join(`user-${socket.user.userId}`);
    }

    // Join global blog feed room
    socket.join("blog-feed");

    // Handle joining a specific post's room for real-time comments
    socket.on("join-post", (postId) => {
      if (postId) {
        socket.join(`post-${postId}`);
        logger.info(
          `User ${socket.user?.userId} joined post room: post-${postId}`
        );
      }
    });

    // Handle leaving a specific post's room
    socket.on("leave-post", (postId) => {
      if (postId) {
        socket.leave(`post-${postId}`);
        logger.info(
          `User ${socket.user?.userId} left post room: post-${postId}`
        );
      }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      logger.info(`User disconnected: ${socket.id}`);
    });
  });

  logger.info("Socket.IO initialized");
  return io;
};

/**
 * Get the Socket.IO instance
 * @returns {Object} Socket.IO instance
 */
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO not initialized");
  }
  return io;
};

/**
 * Emit an event to all connected clients in the blog feed
 * @param {string} event - Event name
 * @param {Object} data - Event data
 */
export const emitToFeed = (event, data) => {
  if (!io) {
    logger.warn("Socket.IO not initialized, skipping feed event emission");
    return;
  }
  io.to("blog-feed").emit(event, data);
};

/**
 * Emit an event to all connected clients in a specific post room
 * @param {string} postId - Post ID
 * @param {string} event - Event name
 * @param {Object} data - Event data
 */
export const emitToPost = (postId, event, data) => {
  if (!io) {
    logger.warn("Socket.IO not initialized, skipping post event emission");
    return;
  }
  io.to(`post-${postId}`).emit(event, data);
};

/**
 * Emit an event to a specific user
 * @param {string} userId - User ID
 * @param {string} event - Event name
 * @param {Object} data - Event data
 */
export const emitToUser = (userId, event, data) => {
  if (!io) {
    logger.warn("Socket.IO not initialized, skipping user event emission");
    return;
  }
  io.to(`user-${userId}`).emit(event, data);
};
