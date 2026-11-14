import type {CatalogRepository} from "../../application/ports/catalog-repository.ts";
import type {Availability,CatalogSnapshot} from "../../domain/catalog/catalog.ts";
import {getSupabaseClient} from "./client.ts";

type Row=Record<string,unknown>;
function rows(value:unknown):Row[] {
 if(!Array.isArray(value)||value.some(v=>!v||typeof v!=="object"||Array.isArray(v)))throw new Error("Catálogo inválido");
 return value as Row[];
}
function text(v:unknown):string {if(typeof v!=="string"||!v.trim())throw new Error("Texto de catálogo inválido");return v;}
function flag(v:unknown):boolean {if(typeof v!=="boolean")throw new Error("Estado de catálogo inválido");return v;}
function nullableText(v:unknown):string|null {return v===null?null:text(v);}
function price(v:unknown):number|null {
 if(v===null)return null;
 if(typeof v!=="number"||!Number.isSafeInteger(v)||v<0)throw new Error("Preço de catálogo inválido");
 return v;
}
function availability(v:unknown):Availability {
 if(v!=="available"&&v!=="unavailable"&&v!=="unknown")throw new Error("Disponibilidade inválida");
 return v;
}
export class SupabaseCatalogRepository implements CatalogRepository {
 async snapshot():Promise<CatalogSnapshot> {
  const db=getSupabaseClient();if(!db)throw new Error("Supabase não configurado");
  const {data,error}=await db.rpc("catalog_snapshot");if(error||!data||typeof data!=="object")throw new Error("Fonte de catálogo indisponível");
  const d=data as Row;
  const mall=d.mall as Row|null;
  const snapshot:CatalogSnapshot={
   mall:mall?{id:text(mall.id),name:text(mall.name),isDemo:flag(mall.is_demo)}:null,
   categories:rows(d.categories).map(r=>({id:text(r.id),label:text(r.label)})),
   types:rows(d.types).map(r=>({id:text(r.id),categoryId:text(r.category_id),name:text(r.name)})),
   products:rows(d.products).map(r=>({id:text(r.id),name:text(r.name),categoryId:text(r.category_id),typeId:text(r.type_id),isDemo:flag(r.is_demo),published:flag(r.published)})),
   variants:rows(d.variants).map(r=>({id:text(r.id),productId:text(r.product_id),label:text(r.label),attributes:r.attributes as Record<string,unknown>})),
   synonyms:rows(d.synonyms).map(r=>({id:text(r.id),term:text(r.term),productId:nullableText(r.product_id),categoryId:nullableText(r.category_id)})),
   stores:rows(d.stores).map(r=>({id:text(r.id),name:text(r.name),mallId:text(r.mall_id),isDemo:flag(r.is_demo),active:flag(r.active),unitId:nullableText(r.unit_id)})),
   offers:rows(d.offers).map(r=>({id:text(r.id),variantId:text(r.variant_id),storeId:text(r.store_id),priceCents:price(r.price_cents),previousPriceCents:price(r.previous_price_cents),availability:availability(r.availability),startsAt:nullableText(r.starts_at),endsAt:nullableText(r.ends_at),updatedAt:nullableText(r.updated_at),published:flag(r.published),isDemo:flag(r.is_demo),revision:price(r.revision)??0}))
  };
  if(!snapshot.mall)throw new Error("Shopping ativo indisponível");
  return snapshot;
 }
}
