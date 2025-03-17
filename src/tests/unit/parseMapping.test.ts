import { parseMapping } from "../../utils/parseMapping";

describe("parseMapping", () => {
  it("should correctly parse simple types", () => {
    const mapping = { name: "String", age: "Number", scores: "Array<Number>" };
    const parsed = parseMapping(mapping);

    expect(parsed.name("John").value).toBe("John");
    expect(parsed.age("25").value).toBe(25);
    expect(parsed.scores("3,2,5,1")).toEqual([1,2,3,5]); // Ordenado
  });

  it("should ignore case and extra spaces", () => {
    const mapping = { Name: " string ", AGE: " NUMBER", Scores: "ARRAY<number> " };
    const parsed = parseMapping(mapping);

    expect(parsed.Name("John").value).toBe("John");
    expect(parsed.AGE("30").value).toBe(30);
    expect(parsed.Scores("4,9,1")).toEqual([1,4,9]); // Ordenado
  });

  it("should return an error for invalid types", () => {
    const mapping = { salary: "MoneyType" };
    expect(() => parseMapping(mapping)).toThrow("Unknown mapping type for key 'salary': MoneyType");
  });

  it("should return error if array<number> contains invalid values", () => {
    const mapping = { scores: "Array<Number>" };
    const parsed = parseMapping(mapping);
    expect(parsed.scores("5, three, 2").error).toBe(true);
  });
});
