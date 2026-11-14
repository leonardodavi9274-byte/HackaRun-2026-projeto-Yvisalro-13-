import type {ActiveMallRecord, MallRepository} from "../../application/ports/mall-repository.ts";
import {DEMO_MAP_DOCUMENT, DEMO_STORES} from "./aurora-seed.ts";

/** Rótulos de 0002_consumer_interests.sql. */
export const DEMO_CATEGORIES: Record<string, string> = {
  moda: "Moda", tenis: "Tênis", eletronicos: "Eletrônicos", beleza: "Beleza", casa: "Casa",
  "cafe-doces": "Café e doces", games: "Games", livros: "Livros", esporte: "Esporte",
};

/** Lojas fictícias das telas do protótipo; espelha 0021_prototype_demo_stores.sql. */
export const PROTOTYPE_STORES: ReadonlyArray<{id: string; name: string; categoryId: string; unitId: string}> = [
  {id: "megatech", name: "Megatech", categoryId: "eletronicos", unitId: "p1-u07"},
  {id: "sport-vibe", name: "Sport Vibe", categoryId: "tenis", unitId: "p2-u06"},
  {id: "som-e-cia", name: "Som&Cia", categoryId: "eletronicos", unitId: "p3-u01"},
];

/**
 * Shopping Aurora em memória, usado quando o Supabase não está configurado.
 * Todos os dados são fictícios (is_demo = true), como em 0016_demo_mall_seed.sql.
 */
export class DemoMallRepository implements MallRepository {
  async activeMall(): Promise<ActiveMallRecord> {
    return {
      mall: {id: "aurora", name: "Shopping Aurora", referenceLat: -10.1844, referenceLng: -48.3336, areaRadiusM: 500, isDemo: true},
      map: {versionLabel: "provisorio-1", source: "provisional", document: structuredClone(DEMO_MAP_DOCUMENT)},
      stores: [...DEMO_STORES, ...PROTOTYPE_STORES].map(s => ({
        id: s.id, name: s.name, category: {id: s.categoryId, label: DEMO_CATEGORIES[s.categoryId] ?? s.categoryId},
        unitId: s.unitId, logoUrl: null, isDemo: true,
      })),
    };
  }
}
