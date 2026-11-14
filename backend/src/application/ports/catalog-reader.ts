/** Dados confirmados pelo futuro catálogo; valores ausentes não devem ser inventados. */
export type CatalogProduct = {
  id: string;
  name: string;
  isDemo: boolean;
};

export type CatalogStore = {
  id: string;
  name: string;
};

export type CatalogOffer = {
  id: string;
  productId: string;
  store: CatalogStore;
  priceCents: number | null;
  availability: "available" | "unavailable" | "unknown";
  isDemo: boolean;
};

/** Ausência, indisponibilidade e falha de acesso têm significados diferentes. */
export type CatalogReference<T> =
  | { status: "found"; item: T }
  | { status: "unavailable" }
  | { status: "missing" };

/**
 * Fronteira a ser implementada pelo catálogo real (C1).
 * Falhas de acesso rejeitam a operação; não são uma lista vazia ou referência ausente.
 * Os resultados de busca são fornecidos pelo catálogo, que define a própria relevância.
 */
export interface CatalogReader {
  findProduct(id: string): Promise<CatalogReference<CatalogProduct>>;
  findOffer(id: string): Promise<CatalogReference<CatalogOffer>>;
  searchProducts(term: string): Promise<CatalogProduct[]>;
}
