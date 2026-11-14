import type {Promotion} from "../../domain/promotions/promotion.ts";
import type {PromotionRepository} from "../../application/ports/promotion-repository.ts";
import {visibleOffer,type CatalogSnapshot,type Offer} from "../../domain/catalog/catalog.ts";
import {SupabaseCatalogRepository} from "./catalog.repository.ts";

function project(snapshot:CatalogSnapshot,offer:Offer):Promotion|null {
 const visible=visibleOffer(snapshot,offer);
 if(!visible||offer.priceCents===null||offer.availability==="unknown"||offer.updatedAt===null)return null;
 return {id:offer.id,revision:offer.revision,storeId:offer.storeId,categoryId:visible.product.categoryId,
  productName:visible.product.name,priceCents:offer.priceCents,previousPriceCents:offer.previousPriceCents,
  availability:offer.availability,startsAt:offer.startsAt,endsAt:offer.endsAt,updatedAt:offer.updatedAt,
  isDemo:visible.isDemo,published:offer.published};
}
export class SupabasePromotionRepository implements PromotionRepository {
 private readonly catalog=new SupabaseCatalogRepository();
 async isActiveMall(mallId:string){return (await this.catalog.snapshot()).mall?.id===mallId;}
 async list(mallId:string){
  const snapshot=await this.catalog.snapshot();if(snapshot.mall?.id!==mallId)return [];
  return snapshot.offers.map(o=>project(snapshot,o)).filter((o):o is Promotion=>o!==null);
 }
 async find(mallId:string,id:string){
  const snapshot=await this.catalog.snapshot();if(snapshot.mall?.id!==mallId)return null;
  const offer=snapshot.offers.find(o=>o.id===id);return offer?project(snapshot,offer):null;
 }
}
