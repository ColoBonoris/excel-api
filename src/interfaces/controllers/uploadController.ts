import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { createJob } from "../../infrastructure/database/repositories/uploadRepository";
import { v4 as uuidv4 } from "uuid";
import { parseMapping } from "../../utils/parseMapping";
import { publishToQueue } from "../../infrastructure/services/rabbitmqService";
import { AppError } from "../../errors/AppError";
import { ErrorType } from "../../enums/errorTypes";
import { asyncHandler } from "../../middleware/asyncHandler";

const UPLOADS_DIR = path.join(__dirname, "../../uploads/");

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export const uploadFile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file || !req.body.mapping) {
    throw new AppError(ErrorType.VALIDATION_ERROR);
    return;
  }

  const allowedMimeTypes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
  ];

  if (
    !allowedMimeTypes.includes(req.file.mimetype) ||
    path.extname(req.file.originalname) !== ".xlsx"
  ) {
    throw new AppError(ErrorType.FORMAT_ERROR);
  }

  let parsedMapping;
  try {
    parsedMapping =
      typeof req.body.mapping === "string"
        ? JSON.parse(req.body.mapping)
        : req.body.mapping;

    parseMapping(parsedMapping);
  } catch (error: any) {
    throw new AppError(ErrorType.VALIDATION_ERROR);
    return;
  }

  const jobId = uuidv4();
  const filePath = path.join(UPLOADS_DIR, `${jobId}.xlsx`);

  fs.renameSync(req.file.path, filePath);

  await createJob(jobId);

  await publishToQueue("file-processing", {
    jobId,
    filePath,
    mapping: parsedMapping,
  });

  res.json({ jobId });
});
