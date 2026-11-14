export type MallRecord = {
  id: string; name: string; referenceLat: number; referenceLng: number; areaRadiusM: number; isDemo: boolean;
};
export type MallMapRecord = { versionLabel: string; source: "provisional" | "coordination"; document: unknown };
export type StoreRecord = {
  id: string; name: string; category: { id: string; label: string };
  unitId: string | null; logoUrl: string | null; isDemo: boolean;
};
export type ActiveMallRecord = { mall: MallRecord; map: MallMapRecord; stores: StoreRecord[] };

/** Falha de acesso aos dados (Supabase ausente ou consulta com erro). */
export class MallRepositoryError extends Error {
  constructor(message: string) { super(message); this.name = "MallRepositoryError"; }
}

export interface MallRepository {
  /** Shopping ativo, mapa ativo e lojas ativas; null quando não houver shopping ou mapa ativo. */
  activeMall(): Promise<ActiveMallRecord | null>;
}
