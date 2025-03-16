import express from "express";
import cors from "cors";
import uploadRoutes from "./interfaces/routes/uploadRoutes";
import { setupSwagger } from "./config/swagger";
import { errorHandler } from "./middleware/errorHandler";
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

// Error handling middleware
interface ErrorHandler {
  (err: Error, req: Request, res: Response, next: NextFunction): void;
}
const errorHandlerMiddleware: ErrorHandler = (err, req, res, next) => errorHandler(err, req, res, next);
app.use(errorHandlerMiddleware);

export default app;