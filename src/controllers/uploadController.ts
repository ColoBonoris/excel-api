import { Request, RequestHandler, Response } from "express";
import { createJob, getJob } from "../repositories/uploadRepository";
import { Queue } from "bullmq";
import { v4 as uuidv4 } from "uuid";

// import { uploadFileUseCase, getStatusUseCase } from "../usecases/uploadUseCase";
// import { processFile } from "../usecases/uploadUseCase";
// export const uploadFileController: RequestHandler = async (req: Request, res: Response) => {
//   try {
//     const taskId = await uploadFileUseCase();
//     res.status(202).json({ taskId, message: "Carga iniciada" });
//   } catch (error) {
//     console.error("❌ Error en uploadFileController:", error);
//     res.status(500).json({ message: "Error interno del servidor" });
//   }
// };
// export const getStatusController: RequestHandler = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { id } = req.params;
//     const status = await getStatusUseCase(id);
//     res.json({ id, status });
//   } catch (error) {
//     console.error("❌ Error en getStatusController:", error);
//     res.status(500).json({ message: "Error interno del servidor" });
//   }
// };


/// another sulition ---------------------------------------

const queue = new Queue("file-processing");

export const uploadFile = async (req: Request, res: Response): Promise<void> => {
  const jobId = uuidv4();
  await createJob(jobId);

  await queue.add("processFile", {
    jobId,
    filePath: req.file?.path,
    mapping: JSON.parse(req.body.mapping)
  });

  res.json({ jobId });
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
