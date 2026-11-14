/** A fonte de produtos ainda não foi disponibilizada pela feature de catálogo. */
export class CatalogUnavailableError extends Error {
  constructor() {
    super("O catálogo de produtos está indisponível no momento.");
    this.name = "CatalogUnavailableError";
    this.code = "CATALOG_UNAVAILABLE";
  }
}

/**
 * A fronteira aceita um provedor real quando C1 estiver disponível. Sem provedor
 * (ou sem a operação necessária), rejeita a chamada em vez de criar resultados.
 */
export function createCatalogRepository(provider = null) {
  function operation(name) {
    if (!provider || typeof provider[name] !== "function") {
      throw new CatalogUnavailableError();
    }
    return provider[name].bind(provider);
  }

  return {
    async findProduct(id, options = {}) {
      return operation("findProduct")(id, options);
    },
    async findOffer(id, options = {}) {
      return operation("findOffer")(id, options);
    },
    async searchProducts(term, options = {}) {
      return operation("searchProducts")(term, options);
    },
  };
}

export const catalogRepository = createCatalogRepository();
