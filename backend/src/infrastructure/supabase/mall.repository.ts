import {getSupabaseClient} from "./client.ts";
import {MallRepositoryError,type ActiveMallRecord,type MallRepository,type StoreRecord} from "../../application/ports/mall-repository.ts";

type CategoryJoin = {id: string; label: string} | {id: string; label: string}[] | null;

export class SupabaseMallRepository implements MallRepository {
  async activeMall(): Promise<ActiveMallRecord | null> {
    const db = getSupabaseClient();
    if (!db) throw new MallRepositoryError("Supabase não configurado");

    const mallResult = await db.from("malls")
      .select("id,name,reference_lat,reference_lng,area_radius_m,is_demo")
      .eq("active", true).maybeSingle();
    if (mallResult.error) throw new MallRepositoryError(`malls: ${mallResult.error.code ?? "erro"}`);
    const mall = mallResult.data;
    if (!mall) return null;

    const [mapResult, storesResult] = await Promise.all([
      db.from("mall_maps").select("version_label,source,document")
        .eq("mall_id", mall.id).eq("active", true).maybeSingle(),
      db.from("stores").select("id,name,unit_id,logo_url,is_demo,category:interest_categories(id,label)")
        .eq("mall_id", mall.id).eq("active", true),
    ]);
    if (mapResult.error) throw new MallRepositoryError(`mall_maps: ${mapResult.error.code ?? "erro"}`);
    if (storesResult.error) throw new MallRepositoryError(`stores: ${storesResult.error.code ?? "erro"}`);
    if (!mapResult.data) return null;

    const stores: StoreRecord[] = (storesResult.data ?? []).map(row => {
      const joined = row.category as CategoryJoin;
      const category = Array.isArray(joined) ? joined[0] : joined;
      if (!category) throw new MallRepositoryError(`stores: categoria ausente para ${row.id}`);
      return {
        id: row.id, name: row.name, category: {id: category.id, label: category.label},
        unitId: row.unit_id ?? null, logoUrl: row.logo_url ?? null, isDemo: Boolean(row.is_demo),
      };
    });

    return {
      mall: {
        id: mall.id, name: mall.name, referenceLat: Number(mall.reference_lat), referenceLng: Number(mall.reference_lng),
        areaRadiusM: Number(mall.area_radius_m), isDemo: Boolean(mall.is_demo),
      },
      map: {versionLabel: mapResult.data.version_label, source: mapResult.data.source, document: mapResult.data.document},
      stores,
    };
  }
}
