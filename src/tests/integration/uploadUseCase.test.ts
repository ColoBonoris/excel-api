import fs from "fs";
import { parseMapping } from "../../utils/parseMapping";
import { processFile } from "../../usecases/uploadUseCase";

jest.mock("../../repositories/uploadRepository", () => ({
  updateJob: jest.fn(),
}));

describe("processFile", () => {
  it("should process a valid Excel file and return correct data", async () => {
    const filePath = "tests/mocks/test.xlsx";
    const mapping = parseMapping({ name: "String", age: "Number" });

    jest.spyOn(fs, "existsSync").mockReturnValue(true);
    jest.spyOn(fs, "unlinkSync").mockImplementation(() => {}); // Mock borrar archivo

    await processFile("test-job", filePath, mapping);

    expect(fs.unlinkSync).toHaveBeenCalledWith(filePath);
  });

  it("should handle errors and report invalid cells", async () => {
    const filePath = "tests/mocks/invalid.xlsx";
    const mapping = parseMapping({ age: "Number" });

    jest.spyOn(fs, "existsSync").mockReturnValue(true);
    jest.spyOn(fs, "unlinkSync").mockImplementation(() => {}); // Mock borrar archivo

    await processFile("test-job", filePath, mapping);

    expect(fs.unlinkSync).toHaveBeenCalledWith(filePath);
  });
});
