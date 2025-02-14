import prisma from "../config/prisma";
import { WebhookType, Webhook, WebhookDocument } from "../models/Webhook";

export default {
  async create(webhook: Webhook): Promise<WebhookDocument> {
    return prisma.webhook.create({
      data: webhook
    });
  },

  async findByType(type: WebhookType): Promise<WebhookDocument[]> {
    return prisma.webhook.findMany({
      where: { type }
    });
  },

  async delete(id: string): Promise<void> {
    await prisma.webhook.delete({
      where: { id }
    });
  },

  async getAll(): Promise<WebhookDocument[]> {
    return prisma.webhook.findMany();
  }
};