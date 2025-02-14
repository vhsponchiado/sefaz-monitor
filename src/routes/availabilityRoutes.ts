import { FastifyInstance } from "fastify";
import AvailabilityController from "../controllers/AvailabilityController";

export default async (app: FastifyInstance) => {
  app.get("/check-availability", AvailabilityController.checkAvailability);
};