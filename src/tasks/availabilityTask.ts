import cron from "node-cron";
import AvailabilityService from "../services/AvailabilityService";

export default {
  schedule: () => {
    cron.schedule("*/5 * * * *", async () => {
      console.log("Running availability check...");
      await AvailabilityService.checkAvailability();
    });
  }
};