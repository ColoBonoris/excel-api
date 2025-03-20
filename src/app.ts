import express from "express";
import cors from "cors";
import uploadRoutes from "./interfaces/routes/uploadRoutes";
import { setupSwagger } from "./config/swagger";
import { errorMiddleware } from "./middleware/errorHandler";
import { Request, Response, NextFunction } from "express";

const app = express();

app.use(express.json());
app.use(cors());

// endpoints prefix
app.use("/api", uploadRoutes);
app.get("/", (req, res) => {
  res.send("API up and working");
});

// Set up swagger
setupSwagger(app);

app.use(errorMiddleware);

export default app;
