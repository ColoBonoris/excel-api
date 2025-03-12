import { Worker } from "bullmq";
import { processFile } from "../usecases/uploadUseCase";

interface JobData {
  jobId: string;
  filePath: string;
  mapping: Record<string, string>;
}

const worker = new Worker("file-processing", async job => {
  const { jobId, filePath, mapping } = job.data as JobData;
  await processFile(jobId, filePath, mapping);
});

console.log("Worker corriendo...");