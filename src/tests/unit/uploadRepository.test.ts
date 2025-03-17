import { updateJob } from "../../infrastructure/database/repositories/uploadRepository";
import { Job } from "../../infrastructure/database/models/Job";

describe("uploadRepository", () => {
  beforeAll(async () => {
    await Job.create({ referenceId: "test-job", status: "pending", jobErrors: [], result: null });
  });

  afterAll(async () => {
    await Job.deleteMany({});
  });

  it("should update job status and result correctly", async () => {
    await updateJob("test-job", { status: "done", result: { data: [{ name: "John" }] } });

    const job = await Job.findOne({ referenceId: "test-job" });
    expect(job).not.toBeNull();
    expect(job?.status).toBe("done");
    expect(job?.result?.data.length).toBe(1);
    expect(job?.result?.data[0].name).toBe("John");
  });

  it("should add errors to job when updating", async () => {
    await updateJob("test-job", { jobErrors: [{ col: "age", row: 5 }] });

    const job = await Job.findOne({ refernceId: "test-job" });
    //@ts-ignore
    expect(job?.jobErrors.length).toBe(1);
    //@ts-ignore
    expect(job?.jobErrors[0].col).toBe("age");
  });
});
