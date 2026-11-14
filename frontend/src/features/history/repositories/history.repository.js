import {getJson, mutate} from "../../../shared/services/http-client.js";

function pathFor(value) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    throw new Error("O serviço de histórico ainda não está configurado.");
  }
  return value;
}

function operationHeaders(operationId) {
  if (typeof operationId !== "string" || !operationId.trim()) {
    throw new Error("A operação de histórico precisa de um identificador para retomada.");
  }
  return {"Idempotency-Key": operationId};
}

function interactionData(interaction) {
  if (interaction?.type === "search" && typeof interaction.term === "string" && interaction.term.trim()) {
    return {type: "search", term: interaction.term};
  }
  const target = interaction?.target;
  if (interaction?.type === "view" && (target?.type === "product" || target?.type === "offer") &&
      typeof target.referenceId === "string" && target.referenceId.trim()) {
    return {type: "view", target: {type: target.type, referenceId: target.referenceId}};
  }
  throw new Error("A interação de produto não está identificada.");
}

/** Os caminhos concretos virão do contrato da API; falhas são propagadas ao chamador. */
export function createHistoryRepository({listPath, recordPath, removePath} = {}) {
  return {
    list({signal} = {}) {
      return getJson(pathFor(listPath), {signal});
    },
    record(interaction, {operationId, signal} = {}) {
      return mutate(pathFor(recordPath), "POST", interactionData(interaction), {
        signal, headers: operationHeaders(operationId),
      });
    },
    remove(id, {operationId, signal} = {}) {
      if (typeof id !== "string" || !id.trim() || typeof removePath !== "function") {
        throw new Error("A entrada ou o serviço de histórico não está disponível.");
      }
      return mutate(pathFor(removePath(id)), "DELETE", undefined, {
        signal, headers: operationHeaders(operationId),
      });
    },
  };
}
