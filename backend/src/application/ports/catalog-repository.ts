import type {CatalogSnapshot} from "../../domain/catalog/catalog.ts";

/** Uma leitura contém o catálogo inteiro em um único snapshot. Falhas são rejeitadas. */
export interface CatalogRepository {
 snapshot():Promise<CatalogSnapshot>;
}
