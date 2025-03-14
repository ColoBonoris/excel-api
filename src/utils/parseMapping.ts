export const parseMapping = (mapping: Record<string, string>) => {
  if (typeof mapping !== "object" || mapping === null) {
    throw new Error("Invalid mapping: must be an object.");
  }

  const typeMappings: Record<
    string,
    (value: any) => { value: any; error?: boolean }
  > = {
    "number": (v) => {
      const num = Number(v);
      if (isNaN(num)) return { value: null, error: true };
      return { value: num };
    },
    "string": (v) => ({ value: String(v).trim() }),
    "array<number>": (v) => {
      try {
        if (typeof v === "string") {
          v = v.replace(/\s+/g, ""); // Eliminar espacios dentro del array
          v = JSON.parse(v); // Intentar parsear si viene como string
        }

        if (!Array.isArray(v)) return { value: null, error: true };

        const parsedArray = v.map((item) => {
          const num = Number(item);
          if (isNaN(num)) return { value: null, error: true };
          return { value: num };
        });

        const hasErrors = parsedArray.some((item) => item.error);
        if (hasErrors) return { value: null, error: true };
        //@ts-ignore
        return { value: parsedArray.map((item) => item.value).sort((a, b) => a - b) };
      } catch (error) {
        return { value: null, error: true };
      }
    }
  };

  const normalizedMapping: Record<string, (value: any) => { value: any; error?: boolean }> = {};

  for (const [key, type] of Object.entries(mapping)) {
    const normalizedType = type.toLowerCase().replace(/\s+/g, ""); // Remove spaces & normalize
    if (!typeMappings[normalizedType]) {
      throw new Error(`Unknown mapping type for key '${key}': ${type}`);
    }
    normalizedMapping[key.trim()] = typeMappings[normalizedType];
  }

  return normalizedMapping;
};
