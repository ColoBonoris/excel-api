import amqplib from "amqplib";

let channel: amqplib.Channel;

export const connectRabbitMQ = async () => {
  try {
    const connection = await amqplib.connect("amqp://guest:guest@localhost:5672");
    channel = await connection.createChannel();
    await channel.assertQueue("file-processing", { durable: true });

    console.log("✅ Connected to RabbitMQ");
  } catch (error) {
    console.error("❌ Failed to connect to RabbitMQ:", error);
    process.exit(1);
  }
};

export const publishToQueue = async (queue: string, message: any) => {
  if (!channel) await connectRabbitMQ();
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), { persistent: true });
  console.log(`📤 Job sent to queue ${queue}:`, message);
};
