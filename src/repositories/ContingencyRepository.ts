import prisma from "../config/prisma.js";
import { Contingency } from "../models/Contingency.js";

export default {
  async getLatest() {
    return prisma.contingency.findFirst({
      orderBy: { createdAt: "desc" },
    });
  },

  async create(data: Contingency) {
    try {
      return await prisma.contingency.create({
        data: { title: data.title, description: data.description },
      });
    } catch (error: any) {
      if (error.code === "P2002") return null;
      throw error;
    }
  },
};
