import {getJson, mutate} from "../../../shared/services/http-client.js";

function pathFor(value) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    throw new Error("O serviço de desejos ainda não está configurado.");
  }
  return value;
}

function operationHeaders(operationId) {
  if (typeof operationId !== "string" || !operationId.trim()) {
    throw new Error("A operação de desejos precisa de um identificador para retomada.");
  }
  return {"Idempotency-Key": operationId};
}

/**
 * Os caminhos são fornecidos quando o contrato real da API estiver disponível.
 * Reutilizar operationId em uma nova tentativa da mesma intenção; uma nova ação
 * deve receber outro identificador. Erros e falhas de rede são propagados.
 */
export function createWishRepository({listPath, savePath, removePath} = {}) {
  return {
    list({signal} = {}) {
      return getJson(pathFor(listPath), {signal});
    },
    save({type, referenceId}, {operationId, signal} = {}) {
      if ((type !== "product" && type !== "offer") ||
          typeof referenceId !== "string" || !referenceId.trim()) {
        throw new Error("Escolha um produto ou uma oferta identificada.");
      }
      return mutate(pathFor(savePath), "POST", {type, referenceId}, {
        signal, headers: operationHeaders(operationId),
      });
    },
    remove(id, {operationId, signal} = {}) {
      if (typeof id !== "string" || !id.trim() || typeof removePath !== "function") {
        throw new Error("O desejo ou o serviço não está disponível.");
      }
      return mutate(pathFor(removePath(id)), "DELETE", undefined, {
        signal, headers: operationHeaders(operationId),
      });
    },
  };
}
