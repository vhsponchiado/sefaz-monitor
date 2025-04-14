import { createServer } from "./config/app.js";
import prisma from "./config/prisma.js";
import technicalNoteTask from "./tasks/technicalNoteTask.js";
import availabilityTask from "./tasks/availabilityTask.js";
import contingencyTask from "./tasks/contingencyTask.js";

const start = async () => {
  const app = createServer();
  const port = 14205;

  // Registrar rotas
  await app.register(import("./routes/index.js"));

  // Iniciar tarefas agendadas
  technicalNoteTask.schedule();
  availabilityTask.schedule();
  contingencyTask.schedule();

  // Iniciar servidor
  app.listen({ port }, (err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`Server running at http://localhost:${port}`);
  });

  process.on("SIGINT", async () => {
    await prisma.$disconnect();
    process.exit();
  });
};

start();
