import fetch from "node-fetch";
import { TechnicalNote } from "../models/TechnicalNote.js";
import { AvailabilityStatus } from "../models/Availability.js";
import WebhookService from "./WebhookService.js";
import { WebhookType } from "../models/Webhook.js";
import { Contingency } from "../models/Contingency.js";

export default {
  async sendTechnicalNoteNotification(note: TechnicalNote) {
    const webhooks = await WebhookService.getWebhooksByType(
      WebhookType.TECHNICAL_NOTE
    );

    console.log("Sending technical note notification to", webhooks);

    for (const webhook of webhooks) {
      await this.sendNotification(
        webhook.url,
        this.createTechnicalNoteMessage(note)
      );
    }
  },

  async sendAvailabilityNotification(status: AvailabilityStatus) {
    const webhooks = await WebhookService.getWebhooksByType(
      WebhookType.AVAILABILITY
    );

    console.log("Sending availability notification to", webhooks);

    for (const webhook of webhooks) {
      await this.sendNotification(
        webhook.url,
        this.createAvailabilityMessage(status)
      );
    }
  },

  async sendContingencyNotification(contingency: Contingency) {
    const webhooks = await WebhookService.getWebhooksByType(
      WebhookType.CONTINGENCY
    );

    console.log("Sending contingency notification to", webhooks);

    for (const webhook of webhooks) {
      await this.sendNotification(
        webhook.url,
        this.createContingencyMessage(contingency)
      );
    }
  },

  createTechnicalNoteMessage(note: TechnicalNote) {
    return {
      embeds: [
        {
          title: "📄 Nova Nota Técnica Encontrada!",
          description: `**${note.title}**\n\n[${note.description}](https://www.nfe.fazenda.gov.br/portal/${note.link})`,
          color: 0x0099ff,
          image: {
            url: "https://media.seudinheiro.com/uploads/2023/03/Dinheiro-pra-Receita-SD.jpg",
          },
        },
      ],
    };
  },

  createContingencyMessage(contingency: Contingency) {
    return {
      embeds: [
        {
          title: `${contingency.title}`,
          description: `**${contingency.description}**`,
          color: 0xda9547,
        },
      ],
    };
  },

  createAvailabilityMessage(status: AvailabilityStatus) {
    const fields = Object.entries(status).map(([autorizador, services]) => ({
      name: `📌 ${autorizador}`,
      value: Object.entries(services)
        .map(([service, status]) => `${service}: ${status}`)
        .join("\n"),
      inline: true,
    }));

    return {
      embeds: [
        {
          title: "📢 Status de Disponibilidade Atualizado",
          color: 0x00ff00,
          fields: fields.slice(0, 25),
          footer: {
            text: `Total de autorizadores: ${Object.keys(status).length}`,
          },
        },
      ],
    };
  },

  async sendNotification(webhookUrl: string, message: any) {
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(message),
      });
    } catch (error) {
      console.error(`Error sending to webhook ${webhookUrl}:`, error);
    }
  },
};
