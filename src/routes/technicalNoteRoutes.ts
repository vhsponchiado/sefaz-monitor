import { FastifyInstance } from "fastify";
import TechnicalNoteController from "../controllers/TechnicalNoteController";

export default async (app: FastifyInstance) => {
  app.get("/check-notes", TechnicalNoteController.checkNotes);
};