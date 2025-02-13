import express from "express";
import * as cheerio from "cheerio";
import cron from "node-cron";
import axios from "axios";
import { PrismaClient } from "@prisma/client";
import fetch from "node-fetch";

const app = express();
const port = process.env.PORT || 6000;
const prisma = new PrismaClient();

async function getLatestNoteFromDB() {
  try {
    return await prisma.technicalNote.findFirst({
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching latest note:", error);
    return null;
  }
}

async function saveNoteToDB(note) {
  try {
    await prisma.technicalNote.create({
      data: {
        title: note.title,
        description: note.description,
      },
    });
    console.log("New note saved to database");
  } catch (error) {
    if (error.code === "P2002") {
      console.log("Note already exists in database");
    } else {
      console.error("Error saving note:", error);
    }
  }
}

async function scrapeWebsite() {
  try {
    const url =
      "https://www.nfe.fazenda.gov.br/portal/listaConteudo.aspx?tipoConteudo=04BIflQt1aY=";

    const headers = {
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

    const response = await axios.get(url, { headers });

    if (response.status !== 200) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const $ = cheerio.load(response.data);
    const technicalNotes = [];

    $("p").each((index, element) => {
      const $element = $(element);
      const title = $element.find("span.tituloConteudo").text().trim();
      let link = $element.find("span.tituloConteudo").parent().attr("href");

      link = link ? link.replace("%20", "").trim() : "";

      if (title) {
        // Encontra o <br> imediatamente após o elemento que contém o título
        const $parentContainer = $element
          .find("span.tituloConteudo")
          .closest("a")
          .parent();

        // Pega todo o conteúdo HTML após o <br>
        let description =
          $parentContainer
            .html()
            .split("<br>")[1] // Divide no primeiro <br>
            ?.replace(/<[^>]*>?/gm, "") // Remove tags HTML remanescentes
            .trim() || "";

        technicalNotes.push({ title, description, link });
      }
    });

    if (technicalNotes.length > 0) {
      const latestNoteFromDB = await getLatestNoteFromDB();
      const newNote = technicalNotes[0];

      if (!latestNoteFromDB || newNote.title !== latestNoteFromDB.title) {
        console.log("\nNew technical note found:");
        console.log("Title:", newNote.title);
        console.log("Description:", newNote.description);

        await saveNoteToDB(newNote);

        const discordMessage = {
          embeds: [
            {
              title: "📄 Nova Nota Técnica Encontrada!",
              description: `**${newNote.title}**\n\n[${newNote.description}](https://www.nfe.fazenda.gov.br/portal/${newNote.link})`,
              color: 0x0099ff,
              image: {
                url: "https://media.seudinheiro.com/uploads/2023/03/Dinheiro-pra-Receita-SD.jpg",
              },
              footer: {
                text: ``,
              },
            },
          ],
        };

        fetch(
          "https://discord.com/api/webhooks/1339655088930684968/_Q7jN35zij-iJxCKtzCZhOK_Og8kydofYNrvDCfojqHDnfmQIcygPqrby0quT_7QoC91",
          {
            method: "POST",
            headers: {
              "Content-type": "application/json",
            },
            body: JSON.stringify(discordMessage),
          }
        ).then((res) => {
          console.log(res);
        });
      } else {
        console.log("\nNo new technical notes found. Last note in DB:");
        console.log("Title:", latestNoteFromDB.title);
        console.log("Date:", latestNoteFromDB.createdAt);
      }
    } else {
      console.log(
        "\nNo technical notes found on the page. The structure might have changed."
      );
    }

    return technicalNotes;
  } catch (error) {
    console.error("\nError scraping website:", error.message);
    return [];
  }
}

async function getLatestAvailabilityFromDB() {
  try {
    return await prisma.serviceAvailability.findFirst({
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching latest availability:", error);
    return null;
  }
}

async function saveAvailabilityToDB(data) {
  try {
    await prisma.serviceAvailability.create({
      data: {
        data: data,
      },
    });
    console.log("New availability data saved to database");
  } catch (error) {
    console.error("Error saving availability data:", error);
  }
}

function mapStatus(imgSrc) {
  if (imgSrc.includes("verde")) return "🟢";
  if (imgSrc.includes("amarela")) return "🟡";
  if (imgSrc.includes("vermelha")) return "🔴";
  return "❓";
}

async function scrapeAvailability() {
  try {
    const url =
      "https://www.nfe.fazenda.gov.br/portal/disponibilidade.aspx?versao=0.00&tipoConteudo=P2c98tUpxrI=";

    const headers = {
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

    const response = await axios.get(url, {
      headers,
      maxRedirects: 3,
      validateStatus: (status) => status >= 200 && status < 400,
    });

    const $ = cheerio.load(response.data);
    const table = $("#ctl00_ContentPlaceHolder1_gdvDisponibilidade2");
    const lastVerification =
      table
        .find("caption")
        .text()
        .match(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}/)?.[0] || "Unknown";

    // Obter dados e transformar na estrutura desejada
    const autorizadores = {};

    table.find("tbody tr").each((i, row) => {
      const cells = $(row).find("td");
      const autorizadorData = {};

      cells.each((j, cell) => {
        const header = $("th").eq(j).text().trim();
        const $cell = $(cell);

        // Extrair o src da imagem ou string vazia
        const imgSrc = $cell.find("img").attr("src") || "";

        // Determinar o valor usando a função mapStatus
        const value = $cell.find("img").length
          ? mapStatus(imgSrc) // Usar a função de mapeamento
          : $cell.text().trim();

        if (header === "Autorizador") {
          autorizadorData.key = value;
        } else {
          autorizadorData[header] = value;
        }
      });

      if (autorizadorData.key) {
        const { key, ...rest } = autorizadorData;
        autorizadores[key] = rest;
      }
    });

    // Verificar mudanças
    const latestFromDB = await getLatestAvailabilityFromDB();
    const previousData = latestFromDB?.data || {};

    if (JSON.stringify(autorizadores) !== JSON.stringify(previousData)) {
      await saveAvailabilityToDB(autorizadores);

      // Montar mensagem para o Discord
      const discordFields = Object.entries(autorizadores).map(
        ([autorizador, dados]) => {
          return {
            name: `📌 ${autorizador}`,
            value: Object.entries(dados)
              .map(([servico, status]) => `${servico}: ${status}`)
              .join("\n"),
            inline: true,
          };
        }
      );

      const discordMessage = {
        embeds: [
          {
            title: "📢 Status de Disponibilidade Atualizado",
            description:
              `**Última Verificação:** ${lastVerification}\n` +
              "```diff\n" +
              "+ Atualização detectada nos seguintes autorizadores:\n" +
              "```",
            color: 0x00ff00,
            fields: discordFields.slice(0, 25), // Limite do Discord
            footer: {
              text: `Total de autorizadores: ${
                Object.keys(autorizadores).length
              }`,
            },
          },
        ],
      };

      await fetch(
        "https://discord.com/api/webhooks/1339655088930684968/_Q7jN35zij-iJxCKtzCZhOK_Og8kydofYNrvDCfojqHDnfmQIcygPqrby0quT_7QoC91",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(discordMessage),
        }
      );
    }

    return {
      lastVerification,
      autorizadores,
    };
  } catch (error) {
    console.error("Erro no scrapeAvailability:", error.message);
    return null;
  }
}

app.get("/", (req, res) => {
  res.send("Server is running");
});

// Endpoint para checar as notas técnicas manualmente
app.get("/check-notes", async (req, res) => {
  try {
    const notes = await scrapeWebsite();
    const dbNotes = await prisma.technicalNote.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.json({
      scrapedNotes: notes,
      databaseNotes: dbNotes,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/check-availability", async (req, res) => {
  try {
    const data = await scrapeAvailability();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Agendar o scraping para rodar a cada 5 minutos
cron.schedule("*/5 * * * *", async () => {
  console.log("\nRunning scheduled scraping task...");
  await scrapeWebsite();
});

// Agendar verificação a cada 5 minutos
cron.schedule("*/5 * * * *", async () => {
  console.log("\nChecking availability...");
  await scrapeAvailability();
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit();
});
