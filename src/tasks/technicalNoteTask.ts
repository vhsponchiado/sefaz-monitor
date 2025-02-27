import cron from "node-cron";
import TechnicalNoteService from "../services/TechnicalNoteService.js";

export default {
  schedule: () => {
    cron.schedule("*/5 * * * *", async () => {
      console.log("Running technical note check...");
      await TechnicalNoteService.checkForNewNotes();
    });
  }
};