import axios from "axios";
import * as cheerio from "cheerio";
import TechnicalNoteRepository from "../repositories/TechnicalNoteRepository.js";
import DiscordService from "./DiscordService.js";
import { TechnicalNote } from "../models/TechnicalNote.js";

const SCRAPE_URL =
  "https://www.nfe.fazenda.gov.br/portal/listaConteudo.aspx?tipoConteudo=04BIflQt1aY=";

export default {
  async scrapeWebsite() {
    try {
      const response = await axios.get(SCRAPE_URL, {
        headers: this.getHeaders(),
      });

      const $ = cheerio.load(response.data);
      const notes: TechnicalNote[] = [];

      $("p").each((index, element) => {
        const $element = $(element);
        const title = $element.find("span.tituloConteudo").text().trim();
        let link =
          $element.find("span.tituloConteudo").parent().attr("href") || "";
        link = link.replace("%20", "").trim();

        if (title) {
          const description =
            $element
              .html()
              ?.split("<br>")[1]
              ?.replace(/<[^>]*>?/gm, "")
              .trim() || "";

          notes.push({ title, description, link });
        }
      });

      return notes;
    } catch (error: any) {
      throw new Error(`Scraping failed: ${error.message}`);
    }
  },

  async checkForNewNotes() {
    const [latestNote, scrapedNotes] = await Promise.all([
      TechnicalNoteRepository.getLatest(),
      this.scrapeWebsite(),
    ]);

    if (scrapedNotes.length > 0) {
      const newNote = scrapedNotes[0];

      if (!latestNote || newNote.title !== latestNote.title) {

        console.log("** New technical note found! **");
        console.log("- Creating new technical note");
        await TechnicalNoteRepository.create(newNote);
        console.log("- Sending notification");
        await DiscordService.sendTechnicalNoteNotification(newNote);
      }
    }
  },

  getHeaders() {
    return {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Encoding": "gzip, deflate, br",
      "Accept-Language": "en-US,en;q=0.8",
      "Cache-Control": "no-cache",
      Cookie:
        "JSESSIONID=javaprod19~413DF4150236B1466C8ECB85EB796C06.catalog19; onlineCampusSelection=C; __cfduid=d5e9cb96f2485f7500fec2116ee8f23381491087061; __utma=59190898.1874896314.1491088625.1491088625.1491088625.1; __utmb=59190898.2.10.1491088625; __utmc=59190898; __utmz=59190898.1491088625.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); __utma=137925942.2000995260.1491087063.1491087063.1491088718.2; __utmb=137925942.2.10.1491088718; __utmc=137925942; __utmz=137925942.1491088718.2.2.utmcsr=google|utmccn=(organic)|utmcmd=organic|utmctr=(not%20provided); ADRUM=s=1491089349546&r=https%3A%2F%2Fwebapp4.asu.edu%2Fcatalog%2Fclasslist%3F-1275642430",
      Pragma: "no-cache",
      Referer: "https://www.nfe.fazenda.gov.br/portal/listaConteudo.aspx",
      "Upgrade-Insecure-Requests": "1",
    };
  },
};
