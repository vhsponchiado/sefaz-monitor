import cron from "node-cron";
import AvailabilityService from "../services/AvailabilityService.js";

export default {
  schedule: () => {
    cron.schedule("*/5 * * * *", async () => {
      console.log("Running availability check...");
      await AvailabilityService.checkAvailability();
    });
  }
};