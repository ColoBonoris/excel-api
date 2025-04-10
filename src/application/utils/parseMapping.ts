// src/utils/parseMapping.ts

export interface ParsedResult {
  value: any;
  error?: boolean;
}

export interface MappingItem {
  key: string; // the original key inside of rawMapping (eg. "name", "age")
  parseFn: (val: any) => ParsedResult;
}

/**
 * parseMapping receives a `rawMapping` as:
 * {
 *   "name": "String",
 *   "age": "Number",
 *   "nums": "Array<Number>"
 * }
 * and returns an array of the same properties order:
 * [
 *   { key: "name",  parseFn: (val)=>{...} },
 *   { key: "age",   parseFn: (val)=>{...} },
 *   { key: "nums",  parseFn: (val)=>{...} }
 * ]
 */
export function parseMapping(
  rawMapping: Record<string, string>,
): MappingItem[] {
  if (typeof rawMapping !== "object" || rawMapping === null) {
    throw new Error("Invalid mapping: must be a non-null object.");
  }

  const typeMappings: Record<string, (val: any) => ParsedResult> = {
    number: (val: any) => {
      const num = Number(val);
      if (isNaN(num)) return { value: null, error: true };
      return { value: num };
    },
    string: (val: any) => {
      return { value: val == null ? "" : String(val).trim() };
    },
    "array<number>": (val: any) => {
      try {
        if (typeof val === "string") {
          val = val.replace(/\s+/g, "");
          if (!val.startsWith("[") && !val.endsWith("]")) {
            // "1,2,3" => "[1,2,3]"
            val = `[${val}]`;
          }
          val = JSON.parse(val);
        }
        if (!Array.isArray(val)) {
          return { value: null, error: true };
        }

        const parsedArray = val.map((item) => {
          const n = Number(item);
          if (isNaN(n)) return { value: null, error: true };
          return { value: n };
        });
        if (parsedArray.some((x) => x.error)) {
          return { value: null, error: true };
        }
        // ordering
        //@ts-ignore
        const sorted = parsedArray.map((x) => x.value).sort((a, b) => a - b);
        return { value: sorted };
      } catch {
        return { value: null, error: true };
      }
    },
  };

  const result: MappingItem[] = [];

  for (const [rawKey, rawType] of Object.entries(rawMapping)) {
    // normalizing type
    const normalizedType = rawType.trim().toLowerCase().replace(/\s+/g, "");
    if (!typeMappings[normalizedType]) {
      throw new Error(`Unknown mapping type for key "${rawKey}": ${rawType}`);
    }

    // keys are not being normalizeed, it is possible to have it done here
    const parseFn = typeMappings[normalizedType];
    result.push({ key: rawKey, parseFn });
  }

  return result;
}
