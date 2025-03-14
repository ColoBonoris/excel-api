import request from "supertest";
import app from "../../app";

describe("POST /upload", () => {
  it("should return 200 and a job ID for valid uploads", async () => {
    const response = await request(app)
      .post("/api/upload")
      .set("x-api-key", "valid-api-key")
      .field("mapping", JSON.stringify({ name: "String", age: "Number" }))
      .attach("file", "tests/mocks/test.xlsx");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("jobId");
  });

  it("should return 400 for invalid requests", async () => {
    const response = await request(app)
      .post("/api/upload")
      .set("x-api-key", "valid-api-key")
      .attach("file", "tests/mocks/test.xlsx");

    expect(response.status).toBe(400);
  });
});
