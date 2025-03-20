import { Request, Response } from "express";
import { getJob } from "../../infrastructure/database/repositories/uploadRepository";
import { asyncHandler } from "../../middleware/asyncHandler";
import { getChunk } from "../../infrastructure/database/repositories/jobDataRepository";

export const getStatus = asyncHandler(async (req: Request, res: Response) => {
  const job = await getJob(req.params.jobId);
  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }

  let response: any = { status: job.status };

  if (job.status === "done") {
    const pageResult = parseInt(req.query.resultPage as string, 10) || 1;
    const pageError = parseInt(req.query.errorPage as string, 10) || 1;

    const resultChunk = await getChunk(job.referenceId, false, pageResult - 1);
    const errorChunk = await getChunk(job.referenceId, true, pageError - 1);

    response.result = resultChunk || [];
    response.errors = errorChunk || [];

    response.resultPage = pageResult;
    response.errorPage = pageError;
  }

  return res.json(response);
});
