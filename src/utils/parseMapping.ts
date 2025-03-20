// src/utils/parseMapping.ts

export interface ParsedResult {
  value: any;
  error?: boolean;
}

/**
 * Recibe un mapping del estilo:
 * {
 *   "name": "String",
 *   "age": "Number",
 *   "nums": "Array<Number>"
 * }
 * Devuelve un objeto:
 * {
 *   "name": (v) => { value, error },
 *   "age":  (v) => { value, error },
 *   "nums": (v) => { value, error }
 * }
 */
export function parseMapping(mapping: Record<string, string>) {
  if (typeof mapping !== "object" || mapping === null) {
    throw new Error("Invalid mapping: must be a non-null object.");
  }

  const typeMappings: Record<
    string,
    (val: any) => ParsedResult
  > = {
    "number": (val: any) => {
      const num = Number(val);
      if (isNaN(num)) return { value: null, error: true };
      return { value: num };
    },
    "string": (val: any) => {
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
        if (!Array.isArray(val)) return { value: null, error: true };

        const parsedArray = val.map((item) => {
          const num = Number(item);
          if (isNaN(num)) return { value: null, error: true };
          return { value: num };
        });
        const hasError = parsedArray.some((x) => x.error);
        if (hasError) return { value: null, error: true };
        //@ts-ignore
        return { value: parsedArray.map((x) => x.value).sort((a, b) => a - b) };
      } catch (error) {
        return { value: undefined, error: true };
      }
    }
  };

  const normalizedMapping: Record<string, (val: any) => ParsedResult> = {};

  for (const [colKey, typeName] of Object.entries(mapping)) {
    const normalizedType = typeName.toLowerCase().replace(/\s+/g, "");
    if (!typeMappings[normalizedType]) {
      throw new Error(`Unknown mapping type for key "${colKey}": ${typeName}`);
    }
    normalizedMapping[colKey.trim()] = typeMappings[normalizedType];
  }

  return normalizedMapping;
}
