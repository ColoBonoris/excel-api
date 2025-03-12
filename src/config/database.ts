import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

export const connectDB = async () => {
  try {
    if(MONGO_URI) await mongoose.connect(MONGO_URI);
    else throw new Error("No database URI found!")
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ Error connecting with MongoDB:", error);
    process.exit(1);
  }
};