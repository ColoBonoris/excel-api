import express from "express";
import { generateNewApiKey, listAllApiKeys } from "../controllers/apiKeyController";

const router = express.Router();

router.post("/generate-api-key", generateNewApiKey);
router.get("/valid-api-keys", listAllApiKeys);

export default router;