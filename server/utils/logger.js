// Simple logging utility for development
export const logger = {
  info: (message) => {
    if (process.env.NODE_ENV !== "test") {
      console.log(
        `[INFO] ${new Date().toISOString()}: ${typeof message === "object" ? JSON.stringify(message) : message}`
      );
    }
  },
  warn: (message) => {
    if (process.env.NODE_ENV !== "test") {
      console.warn(
        `[WARN] ${new Date().toISOString()}: ${typeof message === "object" ? JSON.stringify(message) : message}`
      );
    }
  },
  error: (message) => {
    if (process.env.NODE_ENV !== "test") {
      console.error(
        `[ERROR] ${new Date().toISOString()}: ${typeof message === "object" ? JSON.stringify(message) : message}`
      );
    }
  },
  debug: (message) => {
    if (process.env.NODE_ENV === "development") {
      console.debug(
        `[DEBUG] ${new Date().toISOString()}: ${typeof message === "object" ? JSON.stringify(message) : message}`
      );
    }
  },
};
