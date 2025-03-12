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
        case "Boolean":
          acc[key] = (value: any) => {
            if (typeof value === "boolean") return value;
            if (typeof value === "string") return value.toLowerCase() === "true";
            if (typeof value === "number") return value !== 0;
            return null;
          };
          break;
        case "Date":
          acc[key] = (value: any) => {
            const date = new Date(value);
            return isNaN(date.getTime()) ? null : date;
          };
          break;
        case "JSON":
          acc[key] = (value: any) => {
            try {
              return JSON.parse(value);
            } catch {
              return null;
            }
          };
          break;
        case "Object":
          acc[key] = (value: any) => (typeof value === "object" && value !== null ? value : null);
          break;
        case "Array<String>":
          acc[key] = (value: any) => {
            try {
              const arr = JSON.parse(value);
              return Array.isArray(arr) && arr.every((item) => typeof item === "string") ? arr : null;
            } catch {
              return null;
            }
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
        case "Array<Boolean>":
          acc[key] = (value: any) => {
            try {
              const arr = JSON.parse(value);
              return Array.isArray(arr) && arr.every((item) => typeof item === "boolean") ? arr : null;
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
  