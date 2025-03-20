import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "XLSX Processing API",
      version: "1.0.0",
      description:
        "API documentation for handling XLSX uploads, status checks, and API Key management.",
    },
    servers: [{ url: "http://localhost:3000/api" }],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "x-api-key",
          description: "Enter a valid API Key to access protected endpoints.",
        },
      },
    },
    security: [{ ApiKeyAuth: [] }],
  },
  apis: ["./src/interfaces/routes/*.ts"],
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app: Express) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log("📄 Swagger Docs available at: http://localhost:3000/api-docs");
};
