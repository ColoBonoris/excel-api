import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { connectRabbitMQ } from "../infrastructure/services/rabbitmqService";
import { JobModel } from "../infrastructure/database/models/JobModel";
import { UserModel } from "../infrastructure/database/models/UserModel";
import dotenv from "dotenv";

dotenv.config();

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  console.log("⏳ Setting up test environment...");

  // 🔥 Iniciar MongoDB en memoria
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  process.env.MONGO_URI = mongoUri;

  await mongoose.connect(mongoUri);
  console.log("✅ Connected to in-memory MongoDB for testing");

  // 🔥 Mockear RabbitMQ
  jest.mock("../infrastructure/services/rabbitmqService", () => ({
    publishToQueue: jest.fn(),
    connectRabbitMQ: jest.fn(),
  }));

  // 🔥 Insertar datos de prueba
  await JobModel.insertMany([
    { jobId: "job-1", status: "done", result: { data: [] }, jobErrors: [] },
    { jobId: "job-2", status: "pending", result: null, jobErrors: null },
  ]);

  await UserModel.insertMany([
    { userId: "user-1", apiKey: "test-upload-key" },
    { userId: "user-2", apiKey: "test-status-key" },
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
