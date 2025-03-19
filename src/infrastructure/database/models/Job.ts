import mongoose, { Document } from "mongoose";

interface ErrorEntry {
  col: string;
  row: number;
}

interface JobResult {
  data: any[];
}

export interface IJob extends Document {
  _id: mongoose.Types.ObjectId;
  referenceId: string;
  status: "pending" | "processing" | "done" | "failed";
  jobErrors?: ErrorEntry[];
  result?: JobResult;
  jobErrorsId?: mongoose.Types.ObjectId;
  resultId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new mongoose.Schema<IJob>({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  referenceId: { type: String, required: true },
  status: { type: String, enum: ["pending", "processing", "done", "failed"], default: "pending" },
  jobErrors: { type: Object, default: null },
  result: { type: Object, default: null },
  jobErrorsId: { type: mongoose.Schema.Types.ObjectId, default: null }, // Referencia en GridFS
  resultId: { type: mongoose.Schema.Types.ObjectId, default: null }, // Referencia en GridFS
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

JobSchema.pre<IJob>("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export const Job = mongoose.model<IJob>("Job", JobSchema);
