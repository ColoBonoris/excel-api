import request from "supertest";
import app from "../../app";
import path from "path";

describe("POST /upload", () => {
  const testFile = path.join(__dirname, "../data/valid_test.xlsx");
  const invalidFile = path.join(__dirname, "../data/invalid_test.xlsx");

  it("should return 200 and a job ID for valid uploads", async () => {
    const response = await request(app)
      .post("/api/upload")
      .set("x-api-key", "upload-api-key")
      .attach("file", testFile)
      .field("mapping", JSON.stringify({ name: "String", age: "Number", scores: "Array<Number>" }));

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("jobId");
  });

  it("should return 400 for invalid file format", async () => {
    const response = await request(app)
      .post("/api/upload")
      .set("x-api-key", "upload-api-key")
      .attach("file", invalidFile)
      .field("mapping", JSON.stringify({ name: "String" }));

    expect(response.status).toBe(400);
  });

  it("should return 403 for missing API key", async () => {
    const response = await request(app)
      .post("/api/upload")
      .attach("file", testFile)
      .field("mapping", JSON.stringify({ name: "String", age: "Number" }));

    expect(response.status).toBe(403);
  });
});
