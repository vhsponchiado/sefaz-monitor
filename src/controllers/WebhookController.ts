import { FastifyRequest, FastifyReply } from "fastify";
import WebhookService from "../services/WebhookService";
import { WebhookType } from "../models/Webhook";

interface AddWebhookRequest {
  url: string;
  type: WebhookType;
}

interface WebhookParams {
  id: string;
}

export default {
  async addWebhook(request: FastifyRequest<{ Body: AddWebhookRequest }>, reply: FastifyReply) {
    try {
      const webhook = await WebhookService.addWebhook(request.body);
      return reply.code(201).send(webhook);
    } catch (error) {
      return reply.code(400).send({ error: "Invalid webhook data or URL already exists" });
    }
  },

  async getWebhooks(request: FastifyRequest<{ Querystring: { type?: WebhookType } }>, reply: FastifyReply) {
    try {
      if (request.query.type) {
        const webhooks = await WebhookService.getWebhooksByType(request.query.type);
        return webhooks;
      }
      const allWebhooks = await WebhookService.getAllWebhooks();
      return allWebhooks;
    } catch (error) {
      return reply.code(500).send({ error: "Error fetching webhooks" });
    }
  },

  async removeWebhook(request: FastifyRequest<{ Params: WebhookParams }>, reply: FastifyReply) {
    try {
      await WebhookService.removeWebhook(request.params.id);
      return reply.code(204).send();
    } catch (error) {
      return reply.code(404).send({ error: "Webhook not found" });
    }
  }
};