export type Promotion = {
 id:string; revision:number; storeId:string; categoryId:string; productName:string;
 priceCents:number; previousPriceCents:number|null; availability:"available"|"unavailable";
 startsAt:string|null; endsAt:string|null; updatedAt:string; isDemo:boolean; published:boolean;
};

/** Falha fechado para dados inválidos, ausentes ou fora da vigência. */
export function isEligiblePromotion(p:Promotion, now=Date.now()):boolean {
 const start=p.startsAt===null?null:Date.parse(p.startsAt), end=p.endsAt===null?null:Date.parse(p.endsAt);
 return typeof p.id==="string" && !!p.id && typeof p.storeId==="string" && !!p.storeId &&
  typeof p.categoryId==="string" && !!p.categoryId && typeof p.productName==="string" &&
  p.productName.trim().length>=1 && p.productName.trim().length<=120 &&
  Number.isSafeInteger(p.priceCents) && p.priceCents>=0 &&
  (p.previousPriceCents===null || (Number.isSafeInteger(p.previousPriceCents) && p.previousPriceCents>p.priceCents)) &&
  Number.isSafeInteger(p.revision) && p.revision>0 && typeof p.isDemo==="boolean" &&
  p.published===true && p.availability==="available" && Number.isFinite(Date.parse(p.updatedAt)) &&
  (start===null || (Number.isFinite(start) && start<=now)) &&
  (end===null || (Number.isFinite(end) && now<end)) && (start===null || end===null || start<end);
}

export function publicPromotion({published: _published,...offer}:Promotion) { return offer; }
