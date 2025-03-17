import request from "supertest";
import app from "../../app";
import { Job } from "../../infrastructure/database/models/Job";

describe("GET /status/:jobId", () => {
  beforeAll(async () => {
    await Job.create({ referenceId: "test-job", status: "processing", result: null, jobErrors: [] });
  });

  afterAll(async () => {
    await Job.deleteMany({});
  });

  it("should return 200 and job status", async () => {
    const response = await request(app)
      .get("/api/status/test-job")
      .set("x-api-key", "status-api-key");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("status", "processing");
  });

  it("should return 404 for a non-existing jobId", async () => {
    const response = await request(app)
      .get("/api/status/non-existing")
      .set("x-api-key", "status-api-key");

    expect(response.status).toBe(404);
  });
});
