import mongoose, { Document } from "mongoose";

export interface IJob extends Document {
  referenceId: string;
  status: "pending" | "processing" | "done" | "failed";
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new mongoose.Schema<IJob>({
  referenceId: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "processing", "done", "failed"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

JobSchema.pre<IJob>("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export const Job = mongoose.model<IJob>("Job", JobSchema);
