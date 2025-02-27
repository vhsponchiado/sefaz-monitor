import WebhookRepository from "../repositories/WebhookRepository.js";
import { Webhook, WebhookType, WebhookDocument } from "../models/Webhook.js";

export default {
  async addWebhook(webhook: Webhook): Promise<WebhookDocument> {
    return WebhookRepository.create(webhook);
  },

  async getWebhooksByType(type: WebhookType): Promise<WebhookDocument[]> {
    return WebhookRepository.findByType(type);
  },

  async removeWebhook(id: string): Promise<void> {
    return WebhookRepository.delete(id);
  },

  async getAllWebhooks(): Promise<WebhookDocument[]> {
    return WebhookRepository.getAll();
  }
};