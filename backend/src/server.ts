import { createApp } from "./app.ts";
import { env } from "./config/env.ts";

const server = createApp().listen(env.port, env.host, () => {
  console.log(`WebAPI disponível em http://${env.host}:${env.port}/api/v1`);
});

server.on("error", (error: NodeJS.ErrnoException) => {
  console.error(
    `Não foi possível iniciar a WebAPI (${error.code ?? "UNKNOWN"}).`,
  );
  process.exit(1);
});

let shuttingDown = false;
function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log("Encerrando WebAPI...");
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 5000).unref();
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
