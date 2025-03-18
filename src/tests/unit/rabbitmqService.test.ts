import amqplib from "amqplib";
import { publishToQueue } from "../../infrastructure/services/rabbitmqService";

jest.mock("amqplib", () => ({
  connect: jest.fn().mockResolvedValue({
    createChannel: jest.fn().mockResolvedValue({
      assertQueue: jest.fn(),
      sendToQueue: jest.fn(),
      close: jest.fn()
    }),
    close: jest.fn()
  })
}));

describe("RabbitMQ Service", () => {
  it("should publish a job to the queue", async () => {
    await publishToQueue("file-processing", { referenceId: "test-job", filePath: "path.xlsx" });

    expect(amqplib.connect).toHaveBeenCalledWith("amqp://guest:guest@localhost:5672");
  });
});