export const parseMapping = (mapping: Record<string, string>) => {
  return Object.entries(mapping).reduce((acc, [key, type]) => {
    switch (type) {
      case "String":
        acc[key] = (value: any) => (typeof value === "string" ? value.trim() : String(value));
        break;
      case "Number":
        acc[key] = (value: any) => {
          const num = Number(value);
          return isNaN(num) ? null : num;
        };
        break;
      case "Array<Number>":
        acc[key] = (value: any) => {
          try {
            const arr = JSON.parse(value);
            return Array.isArray(arr) && arr.every((item) => typeof item === "number") ? arr : null;
          } catch {
            return null;
          }
        };
        break;
      default:
        throw new Error(`Unknown mapping type: ${type}`);
    }
    return acc;
  }, {} as Record<string, (value: any) => any>);
};
  