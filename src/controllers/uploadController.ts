import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { createJob, getJob } from "../repositories/uploadRepository";
import { v4 as uuidv4 } from "uuid";
import { parseMapping } from "../utils/parseMapping";
import { publishToQueue } from "../services/rabbitmqService";

const UPLOADS_DIR = path.join(__dirname, "../../uploads/");

// Ensure upload directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export const uploadFile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file || !req.body.mapping) {
      res.status(400).json({ error: "File and mapping are required" });
      return;
    }

    let parsedMapping;
    try {
      parsedMapping = typeof req.body.mapping === "string"
        ? JSON.parse(req.body.mapping)
        : req.body.mapping;

      parseMapping(parsedMapping);
    } catch (error: any) {
      res.status(400).json({ error: `Invalid mapping: ${error.message}` });
      return;
    }

    // Generate unique file path
    const jobId = uuidv4();
    const filePath = path.join(UPLOADS_DIR, `${jobId}.xlsx`);
    
    // Save file to disk
    fs.renameSync(req.file.path, filePath);

    await createJob(jobId);
    
    // Send job to RabbitMQ with only the file path
    await publishToQueue("file-processing", {
      jobId,
      filePath,
      mapping: parsedMapping
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
