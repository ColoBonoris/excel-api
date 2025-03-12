import express from "express";
import { generateNewApiKey, listAllApiKeys } from "../controllers/apiKeyController";

const router = express.Router();

/**
 * @swagger
 * /generate-api-key:
 *   post:
 *     summary: Generate a new API Key
 *     tags: [API Keys]
 *     responses:
 *       200:
 *         description: Returns a newly generated API Key
 */
router.post("/generate-api-key", generateNewApiKey);

/**
 * @swagger
 * /valid-api-keys:
 *   get:
 *     summary: Retrieve all active API Keys
 *     tags: [API Keys]
 *     responses:
 *       200:
 *         description: Returns a list of active API Keys
 */
router.get("/valid-api-keys", listAllApiKeys);

export default router;
