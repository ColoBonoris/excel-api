import xlsx from "xlsx";
import fs from "fs";
import path from "path";

const __dirname = path.resolve()

export const generateXLSX = (filename, rows, columns) => {
  const data = [];
  for (let i = 0; i < rows; i++) {
    const row = {};
    for (let j = 0; j < columns; j++) {
      row[`Column${j}`] = Math.floor(Math.random() * 100);
    }
    data.push(row);
  }

  const ws = xlsx.utils.json_to_sheet(data);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, "Sheet1");

  const filePath = path.join(__dirname, filename);
  xlsx.writeFile(wb, filePath);
  console.log(`✅ Generated test file: ${filePath}`);
};

generateXLSX("large_test.xlsx", 200000, 5);
generateXLSX("valid_test.xlsx", 10, 3);
generateXLSX("invalid_test.xlsx", 10, 3);