import { FastifyInstance } from "fastify";
import ContingencyController from "../controllers/ContingencyController.js";

export default async (app: FastifyInstance) => {
  app.get("/check-contingency", ContingencyController.checkContingency);
};
