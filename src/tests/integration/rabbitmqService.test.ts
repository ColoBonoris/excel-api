import amqplib from "amqplib";

const testRabbitMQ = async () => {
  try {
    const connection = await amqplib.connect("amqp://guest:guest@localhost:5672");
    const channel = await connection.createChannel();
    await channel.assertQueue("test-queue", { durable: false });

    const message = "Hello from RabbitMQ!";
    channel.sendToQueue("test-queue", Buffer.from(message));

    console.log(`📤 Sent: ${message}`);
    await channel.close();
    await connection.close();
  } catch (error) {
    console.error("❌ RabbitMQ connection failed:", error);
  }
};

testRabbitMQ();