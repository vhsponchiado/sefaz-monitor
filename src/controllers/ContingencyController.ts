import { FastifyRequest, FastifyReply } from "fastify";
import ContingencyService from "../services/ContingencyService.js";

export default {
  async checkContingency(_: FastifyRequest, reply: FastifyReply) {
    try {
      const status = await ContingencyService.checkContingency();
      return { status };
    } catch (error: any) {
      reply.status(500).send({ error: error.message });
    }
  }
};