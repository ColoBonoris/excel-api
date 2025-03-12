import fs from "fs";
import path from "path";

// Example mapping: defining expected data types
const mapping = {
  name: "String",
  age: "Number",
  nums: "Array<Number>"
};

// Ensure the test data folder exists
const dataFolder = path.join(__dirname, "../data/");
if (!fs.existsSync(dataFolder)) {
  fs.mkdirSync(dataFolder, { recursive: true });
}

// Write mapping file
const filePath = path.join(dataFolder, "test_mapping.json");
fs.writeFileSync(filePath, JSON.stringify(mapping, null, 2));
console.log(`✅ Mapping JSON generated: ${filePath}`);