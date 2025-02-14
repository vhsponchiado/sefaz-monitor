import { createServer } from "./config/app";
import prisma from "./config/prisma";
import technicalNoteTask from "./tasks/technicalNoteTask";
import availabilityTask from "./tasks/availabilityTask";

const start = async () => {
  const app = createServer();
  const port = 14205;

  // Registrar rotas
  await app.register(import("./routes/index"));

  // Iniciar tarefas agendadas
  technicalNoteTask.schedule();
  availabilityTask.schedule();

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