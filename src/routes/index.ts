import { FastifyInstance } from "fastify";
import technicalNoteRoutes from "./technicalNoteRoutes.js";
import availabilityRoutes from "./availabilityRoutes.js";
import webhookRoutes from "./webhookRoutes.js";
import contingencyRoutes from "./contingencyRoutes.js";

export default async (app: FastifyInstance) => {
  await app.register(technicalNoteRoutes);
  await app.register(availabilityRoutes);
  await app.register(webhookRoutes);
  await app.register(contingencyRoutes);
};
