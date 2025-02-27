import { FastifyInstance } from "fastify";
import technicalNoteRoutes from "./technicalNoteRoutes.js";
import availabilityRoutes from "./availabilityRoutes.js";
import webhookRoutes from "./webhookRoutes.js";

export default async (app: FastifyInstance) => {
  await app.register(technicalNoteRoutes);
  await app.register(availabilityRoutes);
  await app.register(webhookRoutes);
};