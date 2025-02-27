import { FastifyRequest, FastifyReply } from "fastify";
import AvailabilityService from "../services/AvailabilityService.js";

export default {
  async checkAvailability(_: FastifyRequest, reply: FastifyReply) {
    try {
      const status = await AvailabilityService.checkAvailability();
      return { status };
    } catch (error: any) {
      reply.status(500).send({ error: error.message });
    }
  }
};