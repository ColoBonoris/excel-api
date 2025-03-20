import request from "supertest";
import app from "../../app";
import path from "path";
import { ErrorType } from "../../enums/errorTypes";
import { ERROR_DEFINITIONS } from "../../errors/errorMessages";

describe("POST /upload", () => {
  const testFile = path.join(__dirname, "../data/valid_test.xlsx");
  const invalidFile = path.join(__dirname, "../data/descarga.gif");

  it("should return 200 and a job ID for valid uploads", async () => {
    const response = await request(app)
      .post("/api/upload")
      .set("x-api-key", "upload-api-key")
      .attach("file", testFile)
      .field(
        "mapping",
        JSON.stringify({
          name: "String",
          age: "Number",
          scores: "Array<Number>",
        }),
      );

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("jobId");
  });

  it("should return 401 for missing API key", async () => {
    const response = await request(app)
      .post("/api/upload")
      .field("mapping", JSON.stringify({ name: "String" }));

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      error: ErrorType.UNAUTHORIZED,
      message: ERROR_DEFINITIONS[ErrorType.UNAUTHORIZED].message,
    });
  });

  it("should return 403 for invalid API key", async () => {
    const response = await request(app)
      .post("/api/upload")
      .set("x-api-key", "not-valid-key")
      .field("mapping", JSON.stringify({ name: "String" }));

    expect(response.status).toBe(403);
    expect(response.body).toMatchObject({
      error: ErrorType.FORBIDDEN,
      message: ERROR_DEFINITIONS[ErrorType.FORBIDDEN].message,
    });
  });
});
