import mongoose, { Document } from "mongoose";

export interface IApiKey extends Document {
  key: string;
  createdAt: Date;
  active: boolean;
}

const ApiKeySchema = new mongoose.Schema<IApiKey>({
  key: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  active: { type: Boolean, default: true } // Permite activar/desactivar una API Key
});

export const ApiKey = mongoose.model<IApiKey>("ApiKey", ApiKeySchema);