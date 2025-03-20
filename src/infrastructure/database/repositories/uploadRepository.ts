import { Job, IJob } from "../models/Job";

export const createJob = async (jobId: string): Promise<IJob> => {
  const job = new Job({ referenceId: jobId });
  return await job.save();
};

export const updateJob = async (
  jobId: string,
  data: Partial<IJob>,
): Promise<IJob | null> => {
  return await Job.findOneAndUpdate(
    { referenceId: jobId },
    { $set: data },
    { new: true },
  );
};

export const getJob = async (jobId: string): Promise<IJob | null> => {
  return await Job.findOne({ referenceId: jobId });
};

export const deleteJob = async (jobId: string): Promise<void> => {
  await Job.deleteOne({ referenceId: jobId });
};
