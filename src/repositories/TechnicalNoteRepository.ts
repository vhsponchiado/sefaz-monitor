import prisma from "../config/prisma";
import { TechnicalNote } from "../models/TechnicalNote";

export default {
  async getLatest() {
    return prisma.technicalNote.findFirst({
      orderBy: { createdAt: "desc" },
    });
  },

  async create(note: TechnicalNote) {
    try {
      return await prisma.technicalNote.create({
        data: { title: note.title, description: note.description },
      });
    } catch (error: any) {
      if (error.code === "P2002") return null;
      throw error;
    }
  },

  async getAll() {
    return prisma.technicalNote.findMany({
      orderBy: { createdAt: "desc" },
    });
  },
};
