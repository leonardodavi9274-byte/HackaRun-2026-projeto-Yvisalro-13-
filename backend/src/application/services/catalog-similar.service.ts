import {visibleOffer,type PublicOffer} from "../../domain/catalog/catalog.ts";
import {catalogMissing,type CatalogReferenceService} from "./catalog-reference.service.ts";
export class CatalogSimilarService {
 readonly references:CatalogReferenceService;
 constructor(references:CatalogReferenceService){this.references=references;}
 async list(id:string){
  const s=await this.references.snapshot(),variant=s.variants.find(v=>v.id===id),product=variant&&s.products.find(p=>p.id===variant.productId);
  if(!variant||!product?.published)throw catalogMissing();
  const ids=new Set(s.variants.filter(v=>v.id!==id&&s.products.some(p=>p.id===v.productId&&p.published&&p.categoryId===product.categoryId)).map(v=>v.id));
  const offers=s.offers.filter(o=>ids.has(o.variantId)).map(o=>visibleOffer(s,o)).filter((o):o is PublicOffer=>o!==null);
  return {offers};
 }
}
