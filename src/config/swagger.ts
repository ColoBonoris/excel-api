import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

// Swagger options
const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "XLSX File Processing API",
      version: "1.0.0",
      description: "Docs for the XLSX File Processing API",
    },
    servers: [{ url: "http://localhost:3000/api" }],
  },
  apis: ["./src/routes/*.ts"], // Swagger annotations in these files
};

// Generating docs
const swaggerSpec = swaggerJSDoc(options);

// Functions to setup Swagger
export const setupSwagger = (app: Express) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log("📄 Swagger Docs available at: http://localhost:3000/api-docs");
};
