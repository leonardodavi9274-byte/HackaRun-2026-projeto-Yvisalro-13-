import {MapDocumentError,unitFloorIndex,validateMapDocument,type MapDocument} from "../../domain/mall/map-document.ts";
import type {MallRepository} from "../ports/mall-repository.ts";
import {ApiError} from "../../presentation/http/errors/api-error.ts";

export type MallView = {
  mall: {id: string; name: string; isDemo: boolean; reference: {lat: number; lng: number}; areaRadiusM: number};
  map: {versionLabel: string; source: "provisional" | "coordination"; document: MapDocument};
  stores: Array<{
    id: string; name: string; category: {id: string; label: string};
    unitId: string | null; floorId: string | null; logoUrl: string | null; isDemo: boolean;
  }>;
};

const unavailable = () => new ApiError(503, "MAP_UNAVAILABLE", "O mapa do shopping está indisponível no momento.");
const collator = new Intl.Collator("pt-BR");

export class MallService {
  readonly repo: MallRepository;
  constructor(repo: MallRepository) { this.repo = repo; }

  async activeMall(requestId?: string): Promise<MallView> {
    let data;
    try { data = await this.repo.activeMall(); }
    catch (error) {
      console.error(JSON.stringify({requestId, code: "MAP_UNAVAILABLE", stage: "mall", reason: error instanceof Error ? error.message : "erro"}));
      throw unavailable();
    }
    if (!data) throw unavailable();

    let document: MapDocument;
    try { document = validateMapDocument(data.map.document); }
    catch (error) {
      if (!(error instanceof MapDocumentError)) throw error;
      console.error(JSON.stringify({requestId, code: "MAP_INVALID", stage: "mall", version: data.map.versionLabel, reason: error.message}));
      throw new ApiError(503, "MAP_INVALID", "O mapa está temporariamente indisponível");
    }

    const floors = unitFloorIndex(document);
    const stores = data.stores
      .map(store => {
        const floorId = store.unitId ? floors.get(store.unitId) ?? null : null;
        return {...store, unitId: floorId ? store.unitId : null, floorId};
      })
      .sort((a, b) => collator.compare(a.name, b.name));

    return {
      mall: {
        id: data.mall.id, name: data.mall.name,
        isDemo: data.mall.isDemo || data.map.source === "provisional",
        reference: {lat: data.mall.referenceLat, lng: data.mall.referenceLng},
        areaRadiusM: data.mall.areaRadiusM,
      },
      map: {versionLabel: data.map.versionLabel, source: data.map.source, document},
      stores,
    };
  }
}
