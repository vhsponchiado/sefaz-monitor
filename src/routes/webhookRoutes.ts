import { FastifyInstance } from "fastify";
import WebhookController from "../controllers/WebhookController";

export default async (app: FastifyInstance) => {
  app.post("/webhooks", WebhookController.addWebhook);
  app.get("/webhooks", WebhookController.getWebhooks);
  app.delete("/webhooks/:id", WebhookController.removeWebhook);
};