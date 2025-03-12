import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

// Swagger configuration
const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "XLSX Processing API",
      version: "1.0.0",
      description: "API documentation for handling XLSX uploads, status checks, and API Key management.",
    },
    servers: [{ url: "http://localhost:3000/api" }],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "x-api-key",
          description: "Enter a valid API Key to access protected endpoints."
        }
      }
    },
    security: [{ ApiKeyAuth: [] }] // Apply API Key auth globally
  },
  apis: ["./src/routes/*.ts"], // Path to the annotated files
};

// Generate Swagger docs
const swaggerSpec = swaggerJSDoc(options);

// Function to set up Swagger in the app
export const setupSwagger = (app: Express) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log("📄 Swagger Docs available at: http://localhost:3000/api-docs");
};
