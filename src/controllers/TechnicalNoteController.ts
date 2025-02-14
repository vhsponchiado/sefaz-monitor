import { FastifyRequest, FastifyReply } from "fastify";
import TechnicalNoteService from "../services/TechnicalNoteService";
import TechnicalNoteRepository from "../repositories/TechnicalNoteRepository";

export default {
  async checkNotes(_: FastifyRequest, reply: FastifyReply) {
    try {
      await TechnicalNoteService.checkForNewNotes();
      return {};
    } catch (error: any) {
      reply.status(500).send({ error: error.message });
    }
  },
};
