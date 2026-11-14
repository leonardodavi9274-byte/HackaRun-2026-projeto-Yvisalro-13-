export type Availability = "available" | "unavailable" | "unknown";
export type CatalogCategory = {id:string; label:string};
export type CatalogType = {id:string; categoryId:string; name:string};
export type Product = {id:string; name:string; categoryId:string; typeId:string; isDemo:boolean; published:boolean};
export type Variant = {id:string; productId:string; label:string; attributes:Record<string,unknown>};
export type Synonym = {id:string; term:string; productId:string|null; categoryId:string|null};
export type Store = {id:string; name:string; mallId:string; isDemo:boolean; active:boolean; unitId:string|null};
export type Offer = {
 id:string; variantId:string; storeId:string; priceCents:number|null; previousPriceCents:number|null;
 availability:Availability; startsAt:string|null; endsAt:string|null; updatedAt:string|null;
 published:boolean; isDemo:boolean; revision:number;
};
export type CatalogSnapshot = {
 mall:{id:string; name:string; isDemo:boolean}|null; categories:CatalogCategory[]; types:CatalogType[];
 products:Product[]; variants:Variant[]; synonyms:Synonym[]; offers:Offer[]; stores:Store[];
};
export type PublicOffer = {
 id:string; product:{id:string; name:string; categoryId:string; typeId:string};
 variant:{id:string; label:string}; store:{id:string; name:string; floorId:null};
 priceCents:number|null; availability:Availability; isDemo:boolean; offerState:"active"|"upcoming"|"expired";
 promotion:{previousPriceCents:number; startsAt:string|null; endsAt:string|null; updatedAt:string|null}|null;
};

export function visibleOffer(snapshot:CatalogSnapshot, offer:Offer):PublicOffer|null {
 const variant=snapshot.variants.find(v=>v.id===offer.variantId);
 const product=variant&&snapshot.products.find(p=>p.id===variant.productId);
 const store=snapshot.stores.find(s=>s.id===offer.storeId);
 if(!offer.published||!variant||!product?.published||!store?.active||!snapshot.mall||store.mallId!==snapshot.mall.id||
    !snapshot.categories.some(c=>c.id===product.categoryId)) return null;
 const now=Date.now();
 const start=offer.startsAt===null?null:Date.parse(offer.startsAt);
 const end=offer.endsAt===null?null:Date.parse(offer.endsAt);
 const current=(start===null||Number.isFinite(start)&&start<=now)&&(end===null||Number.isFinite(end)&&now<end);
 const offerState=current?"active":start!==null&&start>now?"upcoming":"expired";
 const promotion=current&&offer.priceCents!==null&&offer.previousPriceCents!==null&&offer.previousPriceCents>offer.priceCents
  ?{previousPriceCents:offer.previousPriceCents,startsAt:offer.startsAt,endsAt:offer.endsAt,updatedAt:offer.updatedAt}:null;
 return {id:offer.id,product:{id:product.id,name:product.name,categoryId:product.categoryId,typeId:product.typeId},
  variant:{id:variant.id,label:variant.label},store:{id:store.id,name:store.name,floorId:null},
  priceCents:current?offer.priceCents:null,availability:current?offer.availability:"unknown",
  isDemo:offer.isDemo||product.isDemo||store.isDemo||snapshot.mall.isDemo,offerState,promotion};
}
