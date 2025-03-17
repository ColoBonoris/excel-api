import mongoose from "mongoose";
import { Job } from "../infrastructure/database/models/Job";
import dotenv from "dotenv";

dotenv.config();

const createMockData = async () => {
  try {
    console.log("⏳ Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/excel-api-test");

    console.log("✅ Connected to MongoDB");

    // Borrar datos previos
    await Job.deleteMany({});

    // Insertar nuevos datos de prueba
    await Job.insertMany([
      { jobId: "job-1", status: "done", result: { data: [] }, jobErrors: [] },
      { jobId: "job-2", status: "pending", result: null, jobErrors: null },
    ]);

    console.log("✅ Mock data inserted successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error inserting mock data:", error);
    process.exit(1);
  }
};

createMockData();
