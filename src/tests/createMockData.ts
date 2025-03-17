import mongoose from "mongoose";
import { JobModel } from "../infrastructure/database/models/JobModel";
import { UserModel } from "../infrastructure/database/models/UserModel";
import dotenv from "dotenv";

dotenv.config();

const createMockData = async () => {
  try {
    console.log("⏳ Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/excel-api-test");

    console.log("✅ Connected to MongoDB");

    // Borrar datos previos
    await JobModel.deleteMany({});
    await UserModel.deleteMany({});

    // Insertar nuevos datos de prueba
    await JobModel.insertMany([
      { jobId: "job-1", status: "done", result: { data: [] }, jobErrors: [] },
      { jobId: "job-2", status: "pending", result: null, jobErrors: null },
    ]);

    await UserModel.insertMany([
      { userId: "user-1", apiKey: "test-upload-key" },
      { userId: "user-2", apiKey: "test-status-key" },
    ]);

    console.log("✅ Mock data inserted successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error inserting mock data:", error);
    process.exit(1);
  }
};

createMockData();
