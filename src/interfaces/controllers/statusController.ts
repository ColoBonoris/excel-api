import { Request, Response } from "express";
import { ErrorType } from "../../enums/errorTypes";
import { AppError } from "../../errors/AppError";
import { getJob } from "../../infrastructure/database/repositories/uploadRepository";
import { asyncHandler } from "../../middleware/asyncHandler";


export const getStatus = asyncHandler(async (req: Request, res: Response) => {
  const job = await getJob(req.params.jobId);
  if (!job) {
    throw new AppError(ErrorType.NOT_FOUND);
    return;
  }

  let response: any = { status: job.status };
  if (job.status === "done") {
    if (job.jobErrors) response.errors = job.jobErrors;
    if (job.result) response.result = job.result;
  }

  res.json(response);
});
