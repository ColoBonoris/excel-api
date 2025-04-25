import { connectDB } from '../../config/database';
import amqplib from 'amqplib';
import fs from 'fs';
import { container } from 'tsyringe';
import { IJobRepository } from '../../domain/repositories/IJobRepository';

const QUEUE_NAME = 'file-processing';

const consumeJobs = async () => {
  const connection = await amqplib.connect('amqp://guest:guest@localhost:5672');
  const channel = await connection.createChannel();
  await channel.assertQueue(QUEUE_NAME, { durable: true });

  console.log(`✅ Worker listening on queue: ${QUEUE_NAME}`);

  const jobRepository = container.resolve<IJobRepository>('JobRepository');

  channel.consume(
    QUEUE_NAME,
    async (msg) => {
      if (!msg) return;
      const { jobId, file: fileBase64 } = JSON.parse(msg.content.toString());
      const fileBuffer = Buffer.from(fileBase64, 'base64');
      console.log(`🔄 Processing job ${jobId}...`);

      try {
        const result = { data: [{ name: 'Juan', edad: 30 }] }; // Simulated processing
        const errors = [{ row: 2, col: 1}];

        await jobRepository.saveResult(jobId, result, errors);
        await jobRepository.updateStatus(jobId, 'finished');

        console.log(`✅ Job ${jobId} completed.`);
      } catch (err) {
        await jobRepository.updateStatus(jobId, 'error');
        console.error(`❌ Error processing job ${jobId}:`, err);
      }
    },
    { noAck: true }
  );
};

export const startWorker = async () => {
  console.log('⏳ Connecting Worker to MongoDB...');
  await connectDB();
  console.log('✅ Connected to MongoDB!');
  await consumeJobs();
};

