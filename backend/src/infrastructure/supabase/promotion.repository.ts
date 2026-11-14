import {getSupabaseClient} from "./client.ts";
import type {Promotion} from "../../domain/promotions/promotion.ts";
import type {PromotionRepository} from "../../application/ports/promotion-repository.ts";

const columns="id,revision,store_id,category_id,product_name,price_cents,previous_price_cents,availability,starts_at,ends_at,updated_at,is_demo,published,store:stores!inner(mall_id,active)";
type Row={id:string;revision:number;store_id:string;category_id:string;product_name:string;price_cents:number;previous_price_cents:number|null;availability:"available"|"unavailable";starts_at:string|null;ends_at:string|null;updated_at:string;is_demo:boolean;published:boolean};
function convert(r:Row):Promotion {return {id:r.id,revision:r.revision,storeId:r.store_id,categoryId:r.category_id,productName:r.product_name,priceCents:r.price_cents,previousPriceCents:r.previous_price_cents,availability:r.availability,startsAt:r.starts_at,endsAt:r.ends_at,updatedAt:r.updated_at,isDemo:r.is_demo,published:r.published};}
function database(){const db=getSupabaseClient();if(!db)throw new Error("Supabase não configurado");return db;}
export class SupabasePromotionRepository implements PromotionRepository {
 async isActiveMall(mallId:string){const {data,error}=await database().from("malls").select("id").eq("id",mallId).eq("active",true).maybeSingle();if(error)throw error;return Boolean(data);}
 async list(mallId:string){
  const db=database();const rows:Row[]=[];const pageSize=500;
  for(let from=0;;){
   const {data,error}=await db.from("published_promotional_offers").select(columns).eq("store.mall_id",mallId).eq("store.active",true).eq("published",true).order("id").range(from,from+pageSize-1);
   if(error)throw error;const page=(data??[]) as unknown as Row[];rows.push(...page);if(!page.length)break;from+=page.length;
  }
  return rows.map(convert);
 }
 async find(mallId:string,id:string){const {data,error}=await database().from("published_promotional_offers").select(columns).eq("id",id).eq("store.mall_id",mallId).eq("store.active",true).maybeSingle();if(error)throw error;return data?convert(data as unknown as Row):null;}
}
