import { JobDataModel, IJobChunk } from "../models/JobDataModel";

export const CHUNK_SIZE_RESULT = 100;
export const CHUNK_SIZE_ERRORS = 1000;

export async function insertChunk(
  jobId: string,
  isError: boolean,
  chunkIndex: number,
  rows: any[],
): Promise<IJobChunk> {
  return await JobDataModel.create({ jobId, isError, chunkIndex, rows });
}

export async function getChunk(
  jobId: string,
  isError: boolean,
  chunkIndex: number,
): Promise<any[] | null> {
  const doc = await JobDataModel.findOne({ jobId, isError, chunkIndex });
  return doc ? doc.rows : null;
}

export async function deleteJobChunks(jobId: string): Promise<void> {
  await JobDataModel.deleteMany({ jobId });
}
