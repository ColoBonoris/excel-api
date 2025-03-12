import mongoose, { Document } from "mongoose";

interface ErrorEntry {
  col: string;
  row: number;
}

interface JobResult {
  data: any[];
}

export interface IJob extends Document {
  _id: string;
  status: "pending" | "processing" | "done" | "failed";
  jobErrors?: ErrorEntry[]; // Changed from error to jobErrors for mongoose compatibility
  result?: JobResult; // processed JSON data
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new mongoose.Schema<IJob>({
  _id: { type: String, required: true },
  status: { type: String, enum: ["pending", "processing", "done", "failed"], default: "pending" },
  jobErrors: [{ col: { type: String }, row: { type: Number } }], //  Defined as objects array
  result: { type: Object, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Middleware to update the updatedAt field
JobSchema.pre<IJob>("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export const Job = mongoose.model<IJob>("Job", JobSchema);
