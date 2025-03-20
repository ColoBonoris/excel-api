import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { Job } from "../infrastructure/database/models/Job";
import dotenv from "dotenv";
import { closeRabbitMQConnection } from "../infrastructure/services/rabbitmqService";
import path from "path";
import fs from "fs";

dotenv.config();

let mongoServer: MongoMemoryServer;
const UPLOADS_DIR = path.join(__dirname, "../../uploads/");

beforeAll(async () => {
  console.log("⏳ Setting up test environment...");

  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  process.env.MONGO_URI = mongoUri;

  await mongoose.connect(mongoUri);
  console.log("✅ Connected to in-memory MongoDB for testing");

  jest.mock("../infrastructure/services/rabbitmqService", () => ({
    publishToQueue: jest.fn(),
    connectRabbitMQ: jest.fn(),
  }));

  await Job.insertMany([
    {
      referenceId: "job-1",
      status: "done",
      result: { data: [] },
      jobErrors: [],
    },
    { referenceId: "job-2", status: "pending", result: null, jobErrors: null },
  ]);

  console.log("✅ Test data inserted");
});

const cleanTestUploads = () => {
  if (!fs.existsSync(UPLOADS_DIR)) return;

  fs.readdir(UPLOADS_DIR, (err, files) => {
    if (err) {
      console.error("❌ Error reading uploads directory:", err);
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(UPLOADS_DIR, file);
      fs.unlink(filePath, (err) => {
        if (err) console.error(`⚠️ Failed to delete ${filePath}:`, err);
        else console.log(`🗑️ Deleted test file: ${filePath}`);
      });
    });
  });
};

afterAll(async () => {
  console.log("🛑 Cleaning up test environment...");

  cleanTestUploads();
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
  await closeRabbitMQConnection();

  console.log("🛑 In-memory MongoDB stopped");
});
