import { Job, IJob } from "../models/Job";
import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";
import { Readable } from "stream";

const conn = mongoose.connection;
let gridFSBucket: GridFSBucket;

conn.once("open", () => {
  //@ts-ignore
  gridFSBucket = new GridFSBucket(conn.db, { bucketName: "uploads" });
});

// 🔹 Función para guardar datos pesados en GridFS
const saveToGridFS = async (jobId: string, data: any, fileType: "result" | "errors"): Promise<mongoose.Types.ObjectId> => {
  return new Promise((resolve, reject) => {
    const fileId = new mongoose.Types.ObjectId();
    const writeStream = gridFSBucket.openUploadStreamWithId(fileId, `${jobId}-${fileType}.json`, {
      contentType: "application/json",
    });

    const jsonStream = Readable.from(JSON.stringify(data));

    jsonStream.pipe(writeStream)
      .on("error", reject)
      .on("finish", () => resolve(fileId));
  });
};

// 🔹 Función para obtener datos desde GridFS
const getFromGridFS = async (fileId: mongoose.Types.ObjectId): Promise<any> => {
  return new Promise((resolve, reject) => {
    let jsonData = "";
    const readStream = gridFSBucket.openDownloadStream(fileId);

    readStream
      .on("data", (chunk) => jsonData += chunk.toString())
      .on("error", reject)
      .on("end", () => resolve(JSON.parse(jsonData)));
  });
};

// 🔹 Crear un nuevo Job
export const createJob = async (jobId: string): Promise<IJob> => {
  const job = new Job({ referenceId: jobId });
  return await job.save();
};

// 🔹 Actualizar un Job (soporta GridFS)
export const updateJob = async (jobId: string, data: Partial<IJob>): Promise<IJob | null> => {
  const updateData: Partial<IJob> = {};

  if (data.result) {
    updateData.result = undefined;
    updateData.resultId = await saveToGridFS(jobId, data.result, "result");
  }

  if (data.jobErrors) {
    updateData.jobErrors = undefined;
    updateData.jobErrorsId = await saveToGridFS(jobId, data.jobErrors, "errors");
  }

  return await Job.findOneAndUpdate(
    { referenceId: jobId },
    { $set: { ...data, ...updateData } },
    { new: true }
  );
};

// 🔹 Obtener un Job (recupera los datos de GridFS si existen)
export const getJob = async (jobId: string): Promise<IJob | null> => {
  const job = await Job.findOne({ referenceId: jobId }).lean();
  if (!job) return null;

  if (job.resultId) job.result = await getFromGridFS(job.resultId);
  if (job.jobErrorsId) job.jobErrors = await getFromGridFS(job.jobErrorsId);

  return job;
};

// 🔹 Eliminar archivos innecesarios en GridFS
export const deleteJobData = async (job: IJob) => {
  if (job.resultId) await gridFSBucket.delete(job.resultId);
  if (job.jobErrorsId) await gridFSBucket.delete(job.jobErrorsId);
};

// 🔹 Eliminar un Job y sus archivos
export const deleteJob = async (jobId: string): Promise<void> => {
  const job = await Job.findOne({ referenceId: jobId });
  if (job) await deleteJobData(job);
  await Job.deleteOne({ referenceId: jobId });
};
