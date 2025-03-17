import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { Job } from "../infrastructure/database/models/Job";
import dotenv from "dotenv";

dotenv.config();

let mongoServer: MongoMemoryServer;
let server: any;

beforeAll(async () => {
  console.log("⏳ Setting up test environment...");

  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  await mongoose.connect(mongoUri);

  console.log("✅ Connected to in-memory MongoDB for testing");

  jest.mock("../infrastructure/services/rabbitmqService", () => ({
    publishToQueue: jest.fn(),
    connectRabbitMQ: jest.fn(),
  }));

  await Job.insertMany([
    { jobId: "job-1", status: "done", result: { data: [] }, jobErrors: [] },
    { jobId: "job-2", status: "pending", result: null, jobErrors: [] },
  ]);

  console.log("✅ Test data inserted");

  // Iniciar servidor Express en puerto de prueba
  const app = require("../app").default;
  server = app.listen(3001, () => console.log("✅ Test server running on port 3001"));
});

afterAll(async () => {
  console.log("🛑 Cleaning up test environment...");

  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();

  if (server) {
    server.close(); // ✅ Asegurar que el servidor Express se cierre
  }

  await new Promise((resolve) => setTimeout(resolve, 1000)); // ✅ Evitar errores de Jest

  console.log("🛑 In-memory MongoDB stopped");
});
