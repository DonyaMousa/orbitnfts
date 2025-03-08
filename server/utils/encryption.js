import CryptoJS from "crypto-js";
import jwt from "jsonwebtoken";
import { config } from "dotenv";
import { logger } from "./logger.js";

config();

const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || "your-fallback-encryption-key";
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-for-jwt";
const JWT_EXPIRE = process.env.JWT_EXPIRE || "30d";

// Generate JWT Token
export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRE,
  });
};

export const encryption = {
  encrypt: (text) => {
    try {
      return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
    } catch (error) {
      logger.error("Encryption error:", error);
      throw new Error("Encryption failed");
    }
  },

  decrypt: (ciphertext) => {
    try {
      const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      logger.error("Decryption error:", error);
      throw new Error("Decryption failed");
    }
  },

  hashPassword: async (password) => {
    try {
      const securePassword = require("secure-password");
      const pwd = new securePassword();
      const hash = await pwd.hash(Buffer.from(password));
      return hash.toString("base64");
    } catch (error) {
      logger.error("Password hashing error:", error);
      throw new Error("Password hashing failed");
    }
  },

  verifyPassword: async (password, hash) => {
    try {
      const securePassword = require("secure-password");
      const pwd = new securePassword();
      const verifyResult = await pwd.verify(
        Buffer.from(password),
        Buffer.from(hash, "base64")
      );
      return verifyResult === securePassword.VALID;
    } catch (error) {
      logger.error("Password verification error:", error);
      throw new Error("Password verification failed");
    }
  },
};
