import dotenv from "dotenv";
import app from "./app";
import { connectDB } from "./config/database";
import { connectRabbitMQ } from "./infrastructure/services/rabbitmqService";
import { startGarbageCollector } from "./infrastructure/services/garbageCollector";

dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectDB();
  await connectRabbitMQ();
  startGarbageCollector();

  app.listen(PORT, () => { console.log(`🚀 Server running at http://localhost:${PORT}`); });
};

startServer();