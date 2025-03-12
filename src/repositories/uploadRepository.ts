import { Job, IJob } from "../models/Job";

export const createJob = async (jobId: string): Promise<IJob> => {
  const job = new Job({ _id: jobId });
  return await job.save();
};

export const updateJob = async (jobId: string, data: Partial<IJob>): Promise<IJob | null> => {
  return await Job.findByIdAndUpdate(jobId, data, { new: true });
};

export const getJob = async (jobId: string): Promise<IJob | null> => {
  return await Job.findById(jobId);
};