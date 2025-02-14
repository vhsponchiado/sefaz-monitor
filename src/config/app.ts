import fastify from "fastify";

export const createServer = () => {
  const app = fastify();
  
  return app;
};