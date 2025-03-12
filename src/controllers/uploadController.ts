import { Request, Response } from "express";
import { createJob, getJob } from "../repositories/uploadRepository";
import { Queue } from "bullmq";
import { v4 as uuidv4 } from "uuid";
import { parseMapping } from "../tests/utils/parseMapping";

const queue = new Queue("file-processing");

export const uploadFile = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("Received Request:", req.body); // Debugging logs
    console.log("Received File:", req.file);

    if (!req.file) {
      res.status(400).json({ error: "File is required" });
      return;
    }
    if (!req.body.mapping) {
      res.status(400).json({ error: "Mapping is required" });
      return;
    }

    let parsedMapping;
    try {
      parsedMapping = typeof req.body.mapping === "string"
        ? JSON.parse(req.body.mapping)
        : req.body.mapping;

      parseMapping(parsedMapping); // Validate mapping
    } catch (error: any) {
      res.status(400).json({ error: `Invalid mapping: ${error.message}` });
      return;
    }

    const jobId = uuidv4();
    await createJob(jobId);
    await queue.add("processFile", {
      jobId,
      filePath: req.file.path,
      mapping: JSON.stringify(parsedMapping) // Serialize mapping
    });

    res.json({ jobId });
  } catch (error) {
    console.error("Error in uploadFile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const getStatus = async (req: Request, res: Response): Promise<void> => {
  const job = await getJob(req.params.jobId);
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  let response: any = { status: job.status };
  if (job.status === "done") {
    if (job.jobErrors) response.errors = job.jobErrors;
    if (job.result) response.result = job.result;
  }

  res.json(response);
};
