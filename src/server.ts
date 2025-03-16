import dotenv from "dotenv";
import app from "./app";
import { connectDB } from "./config/database";
import { connectRabbitMQ } from "./infrastructure/services/rabbitmqService";

dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectDB();
  await connectRabbitMQ();

  app.listen(PORT, () => { console.log(`🚀 Server running at http://localhost:${PORT}`); });
};

startServer();