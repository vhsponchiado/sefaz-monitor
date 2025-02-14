import { FastifyInstance } from "fastify";
import technicalNoteRoutes from "./technicalNoteRoutes";
import availabilityRoutes from "./availabilityRoutes";
import webhookRoutes from "./webhookRoutes";

export default async (app: FastifyInstance) => {
  await app.register(technicalNoteRoutes);
  await app.register(availabilityRoutes);
  await app.register(webhookRoutes);
};