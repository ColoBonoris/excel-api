import amqplib from "amqplib";
import fs from "fs";
import { processFile } from "../usecases/uploadUseCase";
import { parseMapping } from "../utils/parseMapping";

const QUEUE_NAME = "file-processing";

const consumeJobs = async () => {
  try {
    const connection = await amqplib.connect("amqp://guest:guest@localhost:5672");
    const channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: true });

    console.log(`⚡ Worker listening on queue: ${QUEUE_NAME}`);

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
          // Always delete the file after processing
          if (fs.existsSync(jobData.filePath)) {
            fs.unlink(jobData.filePath, (err) => {
              if (err) console.error(`⚠️ Failed to delete file ${jobData.filePath}:`, err);
              else console.log(`🗑️ Deleted file ${jobData.filePath}`);
            });
          }
        }
      }
    }, { noAck: true });
  } catch (error) {
    console.error("❌ Failed to connect to RabbitMQ:", error);
  }
};

consumeJobs();
