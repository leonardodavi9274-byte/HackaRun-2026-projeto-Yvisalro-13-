export function createSystemStatus(data) {
  if (data.status !== "ok" || typeof data.application !== "string") {
    throw new Error("O serviço retornou um estado inesperado.");
  }
  return Object.freeze({
    application: data.application,
    available: true,
    databaseConfigured: data.database?.configured === true,
  });
}
