import {visibleOffer,type PublicOffer} from "../../domain/catalog/catalog.ts";
import {catalogMissing,type CatalogReferenceService} from "./catalog-reference.service.ts";
const stock={available:0,unavailable:1,unknown:2};
const compare=(a:string,b:string)=>a.localeCompare(b,"pt-BR",{sensitivity:"base",numeric:true});
export class CatalogComparisonService {
 readonly references:CatalogReferenceService;
 constructor(references:CatalogReferenceService){this.references=references;}
 async get(id:string){
  const s=await this.references.snapshot(),variant=s.variants.find(v=>v.id===id),product=variant&&s.products.find(p=>p.id===variant.productId);
  if(!variant||!product?.published||!s.categories.some(c=>c.id===product.categoryId))throw catalogMissing();
  const offers=s.offers.filter(o=>o.variantId===variant.id).map(o=>visibleOffer(s,o)).filter((o):o is PublicOffer=>o!==null);
  offers.sort((a,b)=>{
   const group=stock[a.availability]-stock[b.availability];if(group)return group;
   if(a.availability==="available"){
    const n=(a.priceCents??Infinity)-(b.priceCents??Infinity);if(!Number.isNaN(n)&&n)return n;
   }
   return compare(a.store.name,b.store.name)||compare(a.id,b.id);
  });
  return {product:{id:product.id,name:product.name,categoryId:product.categoryId,typeId:product.typeId,isDemo:product.isDemo},
   variant:{id:variant.id,label:variant.label},offers};
 }
}
