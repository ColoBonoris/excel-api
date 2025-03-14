import { connectDB } from "../config/database";
import amqplib from "amqplib";
import fs from "fs";
import { processFile } from "../usecases/uploadUseCase";
import { parseMapping } from "../utils/parseMapping";

const QUEUE_NAME = "file-processing";

const consumeJobs = async () => {
  try {
    console.log("⚡ Worker connecting to RabbitMQ...");
    const connection = await amqplib.connect("amqp://guest:guest@localhost:5672");
    const channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: true });

    console.log(`✅ Worker listening on queue: ${QUEUE_NAME}`);

    channel.consume(QUEUE_NAME, async (msg) => {
      if (msg !== null) {
        const jobData = JSON.parse(msg.content.toString());
        console.log(`🔄 Processing job ${jobData.jobId}...`);

        try {
          if (!fs.existsSync(jobData.filePath)) {
            throw new Error(`❌ File not found: ${jobData.filePath}`);
          }

          const mappingFunctions = parseMapping(jobData.mapping);
          await processFile(jobData.jobId, jobData.filePath, mappingFunctions);

          console.log(`✅ Job ${jobData.jobId} completed.`);
        } catch (error) {
          console.error(`❌ Error processing job ${jobData.jobId}:`, error);
        } finally {
          // ✅ Asegurar que el archivo se borre SIEMPRE, incluso si hay errores
          if (fs.existsSync(jobData.filePath)) {
            try {
              fs.unlinkSync(jobData.filePath);
              console.log(`🗑️ Deleted file: ${jobData.filePath}`);
            } catch (unlinkError) {
              console.error(`⚠️ Failed to delete file ${jobData.filePath}:`, unlinkError);
            }
          } else {
            console.warn(`⚠️ File already deleted or not found: ${jobData.filePath}`);
          }
        }
      }
    }, { noAck: true });
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
