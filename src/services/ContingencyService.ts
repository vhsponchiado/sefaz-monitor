import axios from "axios";
import * as cheerio from "cheerio";
import ContingencyRepository from "../repositories/ContingencyRepository.js";
import DiscordService from "./DiscordService.js";
import { Contingency } from "../models/Contingency.js";

const SCRAPE_URL = "https://www.nfe.fazenda.gov.br/portal/principal.aspx";

export default {
  async scrapeWebsite() {
    try {
      const response = await axios.get(SCRAPE_URL, {
        headers: this.getHeaders(),
      });

      const $ = cheerio.load(response.data)
      const contingencies: Contingency[] = []
  
      // Find the caption with the specific text
      $("caption").each((index, element) => {
        const $caption = $(element)
        const captionText = $caption.text().trim()
  
        if (captionText.includes("Contingência Ativada na SVC-AN")) {
          // Get the title from the caption
          const title = captionText
  
          // Find all tr elements in the tbody that follows this caption
          const $tbody = $caption.closest("table").find("tbody")
          const trContents: string[] = []
  
          $tbody.find("tr").each((i, row) => {
            const rowText = $(row).text().trim()
            if (rowText) {
              trContents.push(rowText)
            }
          })
  
          // Join all tr contents with commas
          const description = trContents.join(", ")
  
          // Add to contingencies array
          contingencies.push({
            title,
            description,
          })
        }
      })
  
      return contingencies
    } catch (error: any) {
      throw new Error(`Scraping failed: ${error.message}`)
    }
  },
  

  async checkContingency() {
    const [latestContingency, scrapedContingency] = await Promise.all([
      ContingencyRepository.getLatest(),
      this.scrapeWebsite(),
    ]);

    console.log(scrapedContingency)
    if (scrapedContingency.length > 0) {
      const newContingency = scrapedContingency[0];
 
      if (!latestContingency || newContingency.title !== latestContingency?.title) {
        console.log("** New Contingency found! **");
        console.log("- Creating new Contingency");
        await ContingencyRepository.create(newContingency);
        console.log("- Sending notification");
        await DiscordService.sendContingencyNotification(newContingency);
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
