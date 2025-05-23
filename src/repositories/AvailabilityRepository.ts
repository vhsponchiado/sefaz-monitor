import prisma from "../config/prisma.js";
import { AvailabilityStatus } from "../models/Availability.js";

export default {
  async getLatest() {
    return prisma.serviceAvailability.findFirst({
      orderBy: { createdAt: "desc" },
    });
  },

  async create(data: AvailabilityStatus) {
    return prisma.serviceAvailability.create({ data: { data } });
  }
};