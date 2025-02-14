import fetch from "node-fetch";
import { TechnicalNote } from "../models/TechnicalNote";
import { AvailabilityStatus } from "../models/Availability";

const WEBHOOK_URL = "https://discord.com/api/webhooks/1339655088930684968/_Q7jN35zij-iJxCKtzCZhOK_Og8kydofYNrvDCfojqHDnfmQIcygPqrby0quT_7QoC91";

export default {
  async sendTechnicalNoteNotification(note: TechnicalNote) {
    const message = {
      embeds: [{
        title: "📄 Nova Nota Técnica Encontrada!",
        description: `**${note.title}**\n\n[${note.description}](https://www.nfe.fazenda.gov.br/portal/${note.link})`,
        color: 0x0099ff,
        image: {
          url: "https://media.seudinheiro.com/uploads/2023/03/Dinheiro-pra-Receita-SD.jpg"
        }
      }]
    };

    await this.sendNotification(message);
  },

  async sendAvailabilityNotification(status: AvailabilityStatus) {
    const fields = Object.entries(status).map(([autorizador, services]) => ({
      name: `📌 ${autorizador}`,
      value: Object.entries(services)
        .map(([service, status]) => `${service}: ${status}`)
        .join("\n"),
      inline: true
    }));

    const message = {
      embeds: [{
        title: "📢 Status de Disponibilidade Atualizado",
        color: 0x00ff00,
        fields: fields.slice(0, 25),
        footer: {
          text: `Total de autorizadores: ${Object.keys(status).length}`
        }
      }]
    };

    await this.sendNotification(message);
  },

  async sendNotification(message: any) {
    try {
      await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(message)
      });
    } catch (error) {
      console.error("Discord notification failed:", error);
    }
  }
};