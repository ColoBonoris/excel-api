import { Worker } from "bullmq";
import { processFile } from "../usecases/uploadUseCase";
import { parseMapping } from "../tests/utils/parseMapping";

const worker = new Worker("file-processing", async (job) => {
  try {
    const { jobId, filePath, mapping } = job.data;
    
    // Deserialize and restore mapping functions
    const parsedMapping = JSON.parse(mapping);
    const mappingFunctions = parseMapping(parsedMapping);

    await processFile(jobId, filePath, mappingFunctions);
  } catch (error) {
    console.error("Worker error:", error);
  }
});

console.log("Worker running...");
