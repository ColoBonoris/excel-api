import mongoose from "mongoose";
import { AppError } from "../errors/AppError";
import { ErrorType } from "../enums/errors";
import dotenv from "dotenv"

dotenv.config()

const MONGO_URI = process.env.MONGO_URI || "mongodb://admin:secret@mongo:27017/xlsx-uploader?authSource=admin";
const isTestEnv = process.env.NODE_ENV === "test";

const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; // 5 secs

export const connectDB = async () => {
  let attempts = 0;

  while (attempts < MAX_RETRIES) {
    try {
      console.log("⏳ Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI, {
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
      serverSelectionTimeoutMS: 30000
    });
    console.log("✅ Connected to MongoDB");
      return;
    } catch (error) {
      attempts++;
      console.error(`❌ MongoDB connection failed (${attempts}/${MAX_RETRIES})`, error);
      if (attempts === MAX_RETRIES && !isTestEnv) {
        throw new AppError(ErrorType.DATABASE_ERROR, "Unable to connect to MongoDB", 503);
      }
      await new Promise((res) => setTimeout(res, RETRY_DELAY));
    }
  }
};