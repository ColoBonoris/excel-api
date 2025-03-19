import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const UPLOADS_DIR = path.join(__dirname, "../../uploads/");
const UPLOADS_TTL = parseInt(process.env.UPLOADS_TTL || "86400000", 10);
const INTERVAL = parseInt(process.env.GARBAGE_COLLECTION_INTERVAL || "3600000", 10);

const cleanUploads = () => {
  console.log("🧹 Running Garbage Collector for uploads...");

  if (!fs.existsSync(UPLOADS_DIR)) return;

  const now = Date.now();

  fs.readdir(UPLOADS_DIR, (err, files) => {
    if (err) {
      console.error("❌ Error reading uploads directory:", err);
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(UPLOADS_DIR, file);
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error(`⚠️ Error getting stats for ${file}:`, err);
          return;
        }

        const fileAge = now - stats.mtimeMs;
        if (fileAge > UPLOADS_TTL) {
          fs.unlink(filePath, (err) => {
            if (err) console.error(`⚠️ Failed to delete ${filePath}:`, err);
            else console.log(`🗑️ Deleted old file: ${filePath}`);
          });
        }
      });
    });
  });
};

export const startGarbageCollector = () => {
  console.log(`⏳ Starting Garbage Collector (Interval: ${INTERVAL / 60000} min)`);
  setInterval(cleanUploads, INTERVAL);
};
