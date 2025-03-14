import mongoose from "mongoose";
import { connectDB } from "../config/database";

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await mongoose.connection.close();
});
