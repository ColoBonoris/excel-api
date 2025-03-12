import { Router } from "express";
import { authMiddleware } from '../middleware/auth';
import { getStatus, uploadFile } from "../controllers/uploadController";
import { generateNewApiKey, listAllApiKeys } from "../controllers/apiKeyController";

const router = Router();

router.post('/upload');

// Jobs management
router.post("/upload", authMiddleware, uploadFile);
router.get("/status/:id", getStatus);
// API Key management
router.post("/generate-api-key", generateNewApiKey);
router.get("/valid-api-keys", listAllApiKeys);

export default router;