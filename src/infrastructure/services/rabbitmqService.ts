import amqplib from "amqplib";
import { AppError } from "../../errors/AppError";
import { ErrorType } from "../../enums/errorTypes";
import dotenv from "dotenv";

dotenv.config();

const QUEUE_NAME = "file-processing";
const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; // 5 secs

let channel: amqplib.Channel | null;
let connection: amqplib.ChannelModel | null = null;

export const connectRabbitMQ = async () => {
  let attempts = 0;
  while (attempts < MAX_RETRIES) {
    try {
      connection = await amqplib.connect("amqp://guest:guest@localhost:5672");
      channel = await connection.createChannel();
      await channel.assertQueue(QUEUE_NAME, { durable: true });

      console.log("✅ Connected to RabbitMQ");

      return;
    } catch (error) {
      attempts++;
      console.error(
        `❌ RabbitMQ connection failed (${attempts}/${MAX_RETRIES})`,
        error,
      );
      if (attempts === MAX_RETRIES) {
        throw new AppError(ErrorType.QUEUE_ERROR);
      }
      await new Promise((res) => setTimeout(res, RETRY_DELAY));
    }
  }
};

export const publishToQueue = async (queue: string, message: any) => {
  if (!channel) await connectRabbitMQ();
  channel?.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
    persistent: true,
  });
  console.log(`📤 Job sent to queue ${queue}:`, message);
};

export const closeRabbitMQConnection = async () => {
  try {
    if (channel) {
      await channel.close();
      channel = null;
    }
    if (connection) {
      await connection.close();
      connection = null;
    }
    console.log("🛑 RabbitMQ connection closed");
  } catch (error) {
    console.error("⚠️ Failed to close RabbitMQ connection:", error);
  }
};
