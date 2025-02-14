import { FastifyInstance } from "fastify";
import technicalNoteRoutes from "./technicalNoteRoutes";
import availabilityRoutes from "./availabilityRoutes";

export default async (app: FastifyInstance) => {
  await app.register(technicalNoteRoutes);
  await app.register(availabilityRoutes);
};