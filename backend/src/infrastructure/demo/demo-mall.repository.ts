import type {ActiveMallRecord, MallRepository} from "../../application/ports/mall-repository.ts";
import {VEREDAS_MAP_DOCUMENT, VEREDAS_STORES} from "./veredas-seed.ts";

/** Rótulos de 0002_consumer_interests.sql e das categorias só de lojas de 0021. */
export const DEMO_CATEGORIES: Record<string, string> = {
  moda: "Moda", tenis: "Tênis", eletronicos: "Eletrônicos", beleza: "Beleza", casa: "Casa",
  "cafe-doces": "Café e doces", games: "Games", livros: "Livros", esporte: "Esporte",
  alimentacao: "Alimentação", servicos: "Serviços", lazer: "Lazer",
};

export const DEMO_MALL_ID = "veredas-douradas";

/**
 * Shopping Veredas Douradas em memória, usado quando o Supabase não está configurado: planta de
 * dois pisos em escala real (0021_veredas_douradas_map.sql) com as lojas do catálogo do protótipo
 * posicionadas por backend/scripts/generate-demo-veredas.mjs. Todos os nomes são fictícios.
 */
export class DemoMallRepository implements MallRepository {
  async activeMall(): Promise<ActiveMallRecord> {
    return {
      mall: {id: DEMO_MALL_ID, name: "Shopping Veredas Douradas", referenceLat: -10.1844, referenceLng: -48.3336, areaRadiusM: 500, isDemo: true},
      map: {versionLabel: "planta-2026-11", source: "coordination", document: structuredClone(VEREDAS_MAP_DOCUMENT)},
      stores: VEREDAS_STORES.map(s => ({
        id: s.id, name: s.name, category: {id: s.categoryId, label: DEMO_CATEGORIES[s.categoryId] ?? s.categoryId},
        unitId: s.unitId, logoUrl: null, isDemo: true,
      })),
    };
  }
}
