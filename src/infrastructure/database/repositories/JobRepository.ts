import { IJobRepository } from "../../../domain/repositories/IJobRepository";
import { Job } from "../../../domain/entities/Job";
import { JobModel } from "../models/JobModel";
import { injectable } from "tsyringe";

@injectable()
export class JobRepository implements IJobRepository {
  async save(job: Job): Promise<void> {
    const newJob = new JobModel({
      referenceId: job.referenceId,
      status: job.status,
      errors: job.errors,
    })
    await newJob.save();
  }

  async updateStatus(jobId: string, status: Job["status"]): Promise<void> {
    await JobModel.updateOne(
      { referenceId: jobId },
      { status: status }
    );
  }

  async updateErrors(jobId: string, errors: Job["errors"]): Promise<void> {
    await JobModel.updateOne(
      { referenceId: jobId },
      { errors: errors }
    );
  }

  async saveResult(jobId: string, result: any, errors: Job["errors"]): Promise<void> {
    await JobModel.updateOne(
      { referenceId: jobId },
      { result: result, errors: errors }
    );
  }

  async finishJob(id: string, result: any, errors: Job["errors"]): Promise<void> {
    await JobModel.updateOne(
      { referenceId: id },
      { status: "finished", result: result, errors: errors }
    );
  }

  async getById(id: string): Promise<Job | null> {
    return await JobModel.findOne({
      referenceId: id,
    });
  }

  async getAll(): Promise<Job[]> {
    return await JobModel.find({});
  }

  async getByReferenceId(referenceId: string): Promise<Job | null> {
    return await JobModel.findOne({
      referenceId: referenceId,
    });
  }

  async deleteById(jobId: string): Promise<void> {
    await JobModel.deleteOne({
      referenceId: jobId,
    });
  }



}