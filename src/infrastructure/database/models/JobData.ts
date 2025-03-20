// src/infrastructure/database/models/JobData.ts
import mongoose, { Document } from "mongoose";

export interface IJobChunk extends Document {
  jobId: string;
  isError: boolean;
  chunkIndex: number;
  rows: any[];
}

const JobDataSchema = new mongoose.Schema<IJobChunk>({
  jobId: { type: String, required: true },
  isError: { type: Boolean, required: true },
  chunkIndex: { type: Number, required: true },
  //@ts-ignore
  rows: { type: Array, default: [] },
});

JobDataSchema.index({ jobId: 1, isError: 1, chunkIndex: 1 }, { unique: true });

export const JobData = mongoose.model<IJobChunk>("JobData", JobDataSchema);
