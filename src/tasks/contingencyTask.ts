import cron from "node-cron";
import ContingencyService from "../services/ContingencyService.js";

export default {
  schedule: () => {
    cron.schedule("*/5 * * * *", async () => {
      console.log("Running contingency check...");
      await ContingencyService.checkContingency();
    });
  }
};