import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { Job } from "../infrastructure/database/models/Job";
import dotenv from "dotenv";

dotenv.config();

let mongoServer: MongoMemoryServer;

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
    { jobId: "job-1", status: "done", result: { data: [] }, jobErrors: [] },
    { jobId: "job-2", status: "pending", result: null, jobErrors: null },
  ]);

  console.log("✅ Test data inserted");
});

afterAll(async () => {
  console.log("🛑 Cleaning up test environment...");

  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();

  console.log("🛑 In-memory MongoDB stopped");
});
