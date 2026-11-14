import {createClient,type SupabaseClient} from "@supabase/supabase-js";
import {env} from "../../config/env.ts";
import type {HomeContentRepository} from "../../application/ports/home-content-repository.ts";
import {HOME_LIMITS,previousPrice,utc,type HomeCarousel,type HomeCategory,type HomeOffer,type HomeProduct,type HomeShopping,type HomeStore,type HomeStory,type StockStatus} from "../../domain/home/home-content.ts";

// Leitor público: publishable key, papel anon, sem sessão. A RLS decide o que é visível.
// Nunca usar SUPABASE_SECRET_KEY aqui — chaves secret/service_role ignoram a RLS.
const MEDIA_BUCKET = "catalog-media";
const PRODUCT = "id,name,image_path,image_alt,is_demo";
const STORE = "id,name,floor_label,is_demo,shopping_center_id";
const OFFER = "id,price_cents,currency,previous_price_cents,stock_status,ends_at,last_updated_at,is_demo";

type ProductRow = {id: string; name: string; image_path: string | null; image_alt: string | null; is_demo: boolean};
type StoreRow = {id: string; name: string; floor_label: string | null; is_demo: boolean; shopping_center_id: string};
type OfferRow = {
  id: string; price_cents: number; currency: string; previous_price_cents: number | null; stock_status: StockStatus;
  ends_at: string | null; last_updated_at: string; is_demo: boolean;
  catalog_products: ProductRow | null; stores: StoreRow | null;
};
type StoryRow = {id: string; title: string; image_path: string; image_alt: string; ends_at: string; is_demo: boolean; offer_id: string | null; stores: StoreRow | null; catalog_offers: OfferRow | null};
type CarouselRow = {id: string; title: string; is_demo: boolean; home_carousel_items: {position: number; offer_id: string | null; catalog_products: ProductRow | null; catalog_offers: OfferRow | null}[]};

class HomeQueryError extends Error {constructor(section: string) {super("Consulta da tela inicial falhou: " + section); this.name = "HomeQueryError";}}

export function isHomeCatalogConfigured() {return Boolean(env.supabaseUrl && env.supabasePublishableKey);}

let client: SupabaseClient | undefined;
function db() {
  if (!env.supabaseUrl || !env.supabasePublishableKey) throw new HomeQueryError("configuração");
  client ??= createClient(env.supabaseUrl, env.supabasePublishableKey, {
    global: {fetch: (input, init) => fetch(input, {...init, signal: AbortSignal.any([AbortSignal.timeout(8000), ...(init?.signal ? [init.signal] : [])])})},
    auth: {persistSession: false, autoRefreshToken: false, detectSessionInUrl: false},
  });
  return client;
}

function imageUrl(path: string | null) {
  if (!path) return null;
  if (/^https:\/\//.test(path)) return path;
  return env.supabaseUrl + "/storage/v1/object/public/" + MEDIA_BUCKET + "/" + path.split("/").map(encodeURIComponent).join("/");
}
const product = (p: ProductRow): HomeProduct => {
  const url = imageUrl(p.image_path);
  return {id: p.id, name: p.name, imageUrl: url, imageAlt: url ? p.image_alt : null};
};
const store = (s: StoreRow): HomeStore => ({id: s.id, name: s.name, floorLabel: s.floor_label});
// Oferta só é devolvida com produto e loja visíveis e no shopping consultado.
function offer(o: OfferRow | null, shoppingId: string, fallbackProduct?: ProductRow, fallbackStore?: StoreRow): HomeOffer | null {
  const p = o?.catalog_products ?? fallbackProduct, s = o?.stores ?? fallbackStore;
  if (!o || !p || !s || s.shopping_center_id !== shoppingId || o.currency !== "BRL") return null;
  return {
    offerId: o.id, product: product(p), store: store(s),
    priceCents: o.price_cents, currency: "BRL", previousPriceCents: previousPrice(o.price_cents, o.previous_price_cents),
    stockStatus: o.stock_status, validUntil: o.ends_at ? utc(o.ends_at) : null, lastUpdatedAt: utc(o.last_updated_at),
    isDemo: o.is_demo || p.is_demo || s.is_demo,
  };
}
const rows = <T>(section: string, result: {data: unknown; error: unknown}) => {
  if (result.error) throw new HomeQueryError(section);
  return (result.data ?? []) as T[];
};

export class SupabaseHomeContentRepository implements HomeContentRepository {
  async defaultShopping(): Promise<HomeShopping | null> {
    const result = await db().from("shopping_centers").select("id,name,is_demo").eq("is_home_default", true).limit(1);
    const row = rows<{id: string; name: string; is_demo: boolean}>("shopping", result)[0];
    return row ? {id: row.id, name: row.name, isDemo: row.is_demo} : null;
  }

  async categories(shoppingId: string): Promise<HomeCategory[]> {
    const result = await db().rpc("hy_home_categories", {p_shopping_center_id: shoppingId, p_limit: HOME_LIMITS.categories});
    return rows<{id: string; label: string; is_demo: boolean}>("categorias", result).map(c => ({id: c.id, label: c.label, isDemo: c.is_demo}));
  }

  async featuredOffers(shoppingId: string): Promise<HomeOffer[]> {
    const result = await db().from("catalog_offers")
      .select(OFFER + ",catalog_products!inner(" + PRODUCT + "),stores!inner(" + STORE + ")")
      .eq("stores.shopping_center_id", shoppingId).not("home_rank", "is", null)
      .order("home_rank").order("id").limit(HOME_LIMITS.featuredOffers);
    return rows<OfferRow>("ofertas", result).flatMap(o => offer(o, shoppingId) ?? []);
  }

  async stories(shoppingId: string): Promise<HomeStory[]> {
    const result = await db().from("promo_stories")
      .select("id,title,image_path,image_alt,ends_at,is_demo,offer_id,stores!inner(" + STORE + "),catalog_offers(" + OFFER + ",catalog_products(" + PRODUCT + "))")
      .eq("stores.shopping_center_id", shoppingId)
      .order("sort_order").order("id").limit(HOME_LIMITS.stories);
    return rows<StoryRow>("stories", result).flatMap(s => {
      const url = imageUrl(s.image_path);
      if (!s.stores || !url) return [];
      const linked = offer(s.catalog_offers, shoppingId, undefined, s.stores);
      // Story com oferta vinculada que deixou de ser visível não é exibido.
      if (s.offer_id && !linked) return [];
      return [{id: s.id, title: s.title, imageUrl: url, imageAlt: s.image_alt, store: store(s.stores), offer: linked, validUntil: utc(s.ends_at), isDemo: s.is_demo || s.stores.is_demo || Boolean(linked?.isDemo)}];
    });
  }

  async carousels(shoppingId: string): Promise<HomeCarousel[]> {
    const result = await db().from("home_carousels")
      .select("id,title,is_demo,sort_order,home_carousel_items(position,offer_id,catalog_products!inner(" + PRODUCT + "),catalog_offers(" + OFFER + ",stores(" + STORE + ")))")
      .order("sort_order").order("id").limit(HOME_LIMITS.carousels)
      .order("position", {referencedTable: "home_carousel_items"})
      .limit(HOME_LIMITS.carouselProducts, {referencedTable: "home_carousel_items"});
    return rows<CarouselRow>("carrosséis", result).flatMap(c => {
      const seen = new Set<string>();
      const products = (c.home_carousel_items ?? []).flatMap(item => {
        const p = item.catalog_products;
        if (!p || seen.has(p.id)) return [];
        seen.add(p.id);
        const linked = offer(item.catalog_offers, shoppingId, p);
        return [{position: item.position, product: product(p), offer: linked, isDemo: p.is_demo || Boolean(linked?.isDemo)}];
      }).sort((a, b) => a.position - b.position);
      if (!products.length) return [];
      return [{id: c.id, title: c.title, source: "editorial" as const, isDemo: c.is_demo || products.some(p => p.isDemo), products}];
    });
  }
}
