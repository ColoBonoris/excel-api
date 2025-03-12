import xlsx from "xlsx";
import fs from "fs";
import path from "path";

// Function to generate an array of random numbers
const generateNumbersArray = (length: number): number[] => {
  return Array.from({ length }, () => Math.floor(Math.random() * 100));
};

// Generating larger test data
const testData = Array.from({ length: 50 }, (_, i) => ({
  name: `User ${i + 1}`,
  age: Math.floor(Math.random() * 60) + 18, // Random age between 18 and 78
  nums: JSON.stringify(generateNumbersArray(5)) // Store as a JSON string
}));

// Function to generate an Excel file
const generateExcel = (filename: string, data: any[]) => {
  const ws = xlsx.utils.json_to_sheet(data);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, "Sheet1");

  const filePath = path.join(__dirname, "../data/", filename);
  xlsx.writeFile(wb, filePath);
  console.log(`✅ Excel file generated: ${filePath}`);
};

// Ensure the test data folder exists
const dataFolder = path.join(__dirname, "../data/");
if (!fs.existsSync(dataFolder)) {
  fs.mkdirSync(dataFolder, { recursive: true });
}

// Generate the test Excel file
generateExcel("test_data.xlsx", testData);