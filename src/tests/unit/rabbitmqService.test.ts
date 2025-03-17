import { publishToQueue } from "../../infrastructure/services/rabbitmqService";
import amqplib from "amqplib";

jest.mock("amqplib", () => ({
  connect: jest.fn().mockResolvedValue({
    createChannel: jest.fn().mockResolvedValue({
      assertQueue: jest.fn(),
      sendToQueue: jest.fn(),
    }),
  }),
}));

describe("RabbitMQ Service", () => {
  it("should publish a job to the queue", async () => {
    await publishToQueue("file-processing", { referenceId: "test-job", filePath: "path.xlsx" });

    expect(amqplib.connect).toHaveBeenCalledWith("amqp://guest:guest@localhost:5672");
  });
});
