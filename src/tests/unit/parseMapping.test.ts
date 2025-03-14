import { parseMapping } from "../../utils/parseMapping";


describe("parseMapping", () => {
  it("should correctly parse simple types", () => {
    const mapping = parseMapping({
      name: "String",
      age: "Number",
      scores: "Array<Number>",
    });

    expect(mapping.name("John")).toEqual({ value: "John" });
    expect(mapping.age("25")).toEqual({ value: 25 });
    expect(mapping.scores("[3, 1, 2]")).toEqual({ value: [1, 2, 3] }); // Array ordenado
  });

  it("should return an error for invalid values", () => {
    const mapping = parseMapping({ age: "Number", scores: "Array<Number>" });

    expect(mapping.age("abc").error).toBe(true);
    expect(mapping.scores("[1, x, 3]").error).toBe(true);
  });

  it("should handle extra spaces and case-insensitivity", () => {
    const mapping = parseMapping({ Name: " string ", AGE: " NUMBER " });

    expect(mapping.Name("  Alice  ")).toEqual({ value: "Alice" });
    expect(mapping.AGE("  42 ")).toEqual({ value: 42 });
  });
});
