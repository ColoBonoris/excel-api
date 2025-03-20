// tests/unit/uploadRepository.test.ts
import {
  createJob,
  deleteJob,
  getJob,
  updateJob,
} from "../../infrastructure/database/repositories/uploadRepository";

describe("uploadRepository (unit)", () => {
  it("should create a new job", async () => {
    const jobId = "test-job";
    const job = await createJob(jobId);
    expect(job.referenceId).toBe(jobId);
    expect(job.status).toBe("pending");
  });

  it("should update a job status to processing", async () => {
    const jobId = "test-update";
    await createJob(jobId);
    const updated = await updateJob(jobId, { status: "processing" });
    expect(updated?.status).toBe("processing");
  });

  it("should get a job by referenceId", async () => {
    const jobId = "test-get";
    await createJob(jobId);
    const foundJob = await getJob(jobId);
    expect(foundJob).not.toBeNull();
    expect(foundJob?.referenceId).toBe(jobId);
  });

  it("should delete a job", async () => {
    const jobId = "test-delete";
    await createJob(jobId);
    await deleteJob(jobId);
    const found = await getJob(jobId);
    expect(found).toBeNull();
  });
});
