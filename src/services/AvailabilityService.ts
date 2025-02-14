import axios from "axios";
import * as cheerio from "cheerio";
import AvailabilityRepository from "../repositories/AvailabilityRepository";
import DiscordService from "./DiscordService";
import { AvailabilityStatus } from "../models/Availability";

const SCRAPE_URL =
  "https://www.nfe.fazenda.gov.br/portal/disponibilidade.aspx?versao=0.00&tipoConteudo=P2c98tUpxrI=";

export default {
  async scrapeAvailability() {
    try {
      const response = await axios.get(SCRAPE_URL, {
        headers: this.getHeaders(),
        maxRedirects: 3,
      });

      const $ = cheerio.load(response.data);
      const status: AvailabilityStatus = {};

      $("#ctl00_ContentPlaceHolder1_gdvDisponibilidade2 tbody tr").each(
        (i, row) => {
          const cells = $(row).find("td");
          const autorizadorData: { [key: string]: string } = {};

          cells.each((j, cell) => {
            const header = $("th").eq(j).text().trim();
            const $cell = $(cell);

            if (header === "Autorizador") {
              autorizadorData.key = $cell.text().trim();
            } else {
              const imgSrc = $cell.find("img").attr("src") || "";
              autorizadorData[header] = this.mapStatus(imgSrc);
            }
          });

          if (autorizadorData.key) {
            const { key, ...rest } = autorizadorData;
            status[key] = rest;
          }
        }
      );

      return status;
    } catch (error: any) {
      throw new Error(`Availability scraping failed: ${error.message}`);
    }
  },

  async checkAvailability() {
    const [latestStatus, currentStatus] = await Promise.all([
      AvailabilityRepository.getLatest(),
      this.scrapeAvailability(),
    ]);

    if (JSON.stringify(currentStatus) !== JSON.stringify(latestStatus?.data)) {
      console.log("** Availability status has changed! **");
      console.log("- Creating new availability status");
      await AvailabilityRepository.create(currentStatus);
      console.log("- Sending availability notification");
      await DiscordService.sendAvailabilityNotification(currentStatus);
    }
  },

  mapStatus(imgSrc: string) {
    if (imgSrc.includes("verde")) return "🟢";
    if (imgSrc.includes("amarela")) return "🟡";
    if (imgSrc.includes("vermelha")) return "🔴";
    return "-";
  },

  getHeaders() {
    return {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Encoding": "gzip, deflate, br",
      "Accept-Language": "pt-BR,pt;q=0.9",
      "Cache-Control": "no-cache",
      Cookie:
        "JSESSIONID=javaprod19~413DF4150236B1466C8ECB85EB796C06.catalog19; onlineCampusSelection=C; __utma=59190898.1874896314.1491088625.1491088625.1491088625.1; __utmb=59190898.2.10.1491088625; __utmc=59190898; __utmz=59190898.1491088625.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none);",
      Pragma: "no-cache",
      Referer: "https://www.nfe.fazenda.gov.br/portal/disponibilidade.aspx",
      "Upgrade-Insecure-Requests": "1",
    };
  },
};
