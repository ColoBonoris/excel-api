import { connectDB } from "../../config/database";
import amqplib from "amqplib";
import fs from "fs";
import { processExcelFile } from "../../application/usecases/excelProcessor";

const QUEUE_NAME = "file-processing";

const consumeJobs = async () => {
  try {
    console.log("⚡ Worker connecting to RabbitMQ...");
    const connection = await amqplib.connect(
      "amqp://guest:guest@localhost:5672",
    );
    const channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: true });

    console.log(`✅ Worker listening on queue: ${QUEUE_NAME}`);

    channel.consume(
      QUEUE_NAME,
      async (msg) => {
        if (msg !== null) {
          const jobData = JSON.parse(msg.content.toString());
          console.log(`🔄 Processing job ${jobData.jobId}...`);

          try {
            if (!fs.existsSync(jobData.filePath)) {
              throw new Error(`❌ File not found: ${jobData.filePath}`);
            }

            const rawMapping = jobData.mapping;

            await processExcelFile(jobData.jobId, jobData.filePath, rawMapping);

            console.log(`✅ Job ${jobData.jobId} completed.`);
          } catch (error) {
            console.error(`❌ Error processing job ${jobData.jobId}:`, error);
          }
        }
      },
      { noAck: true },
    );
  } catch (error) {
    console.error("❌ Failed to connect to RabbitMQ:", error);
  }
};

const startWorker = async () => {
  console.log("⏳ Connecting Worker to MongoDB...");
  await connectDB();
  console.log("✅ Connected to MongoDB!");
  await consumeJobs();
};

startWorker();
