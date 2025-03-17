import mongoose from "mongoose";

const teardown = async () => {
  console.log("🛑 Cleaning up test database...");
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  console.log("🛑 Test database cleaned up!");
  process.exit(0);
};

teardown();
