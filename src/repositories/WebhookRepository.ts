import prisma from "../config/prisma.js";
import { WebhookType, Webhook, WebhookDocument } from "../models/Webhook.js";

export default {
  async create(webhook: Webhook): Promise<WebhookDocument> {
    try {
      const createdWebhook = await prisma.webhook.create({
        data: {
          url: webhook.url,
          type: webhook.type as WebhookType,
        },
      });

      return {
        ...createdWebhook,
        type: WebhookType[createdWebhook.type as keyof typeof WebhookType],
      };
    } catch (err) {
      console.error("Erro ao criar webhook:", err);
      throw new Error("Erro ao criar webhook"); // ou pode retornar algo padrão, se quiser
    }
  },

  async findByType(type: WebhookType): Promise<WebhookDocument[]> {
    const webhooks = await prisma.webhook.findMany({
      where: { type },
    });

    return webhooks.map((webhook) => ({
      ...webhook,
      type: WebhookType[webhook.type as keyof typeof WebhookType], // Converte string para enum
    }));
  },

  async delete(id: string): Promise<void> {
    await prisma.webhook.delete({
      where: { id },
    });
  },

  async getAll(): Promise<WebhookDocument[]> {
    const webhooks = await prisma.webhook.findMany();

    return webhooks.map((webhook) => ({
      ...webhook,
      type: WebhookType[webhook.type as keyof typeof WebhookType],
    }));
  },
};
