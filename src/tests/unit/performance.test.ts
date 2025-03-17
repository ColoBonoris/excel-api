import request from "supertest";
import app from "../../app";
import path from "path";

describe("Performance Test - Large File", () => {
  const largeFile = path.join(__dirname, "../data/large_test.xlsx");

  it("should process 200,000 rows without failing", async () => {
    const response = await request(app)
      .post("/api/upload")
      .set("x-api-key", "upload-api-key")
      .attach("file", largeFile)
      .field("mapping", JSON.stringify({ numberColumn: "Array<Number>" }));

    expect(response.status).toBe(200);
  });
});
