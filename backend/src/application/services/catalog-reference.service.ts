import type {CatalogRepository} from "../ports/catalog-repository.ts";
import {visibleOffer} from "../../domain/catalog/catalog.ts";
import {ApiError} from "../../presentation/http/errors/api-error.ts";
import type {CatalogReader} from "../ports/catalog-reader.ts";

export const catalogUnavailable=()=>new ApiError(503,"CATALOG_UNAVAILABLE","O catálogo está indisponível no momento.");
export const catalogMissing=()=>new ApiError(404,"CATALOG_ITEM_NOT_FOUND","Produto não encontrado.");
export class CatalogReferenceService {
 readonly reader:CatalogReader;
 readonly repo:CatalogRepository;
 constructor(repo:CatalogRepository,reader:CatalogReader){this.repo=repo;this.reader=reader;}
 async snapshot(){try{return await this.repo.snapshot();}catch{throw catalogUnavailable();}}
 async categories(){
  const s=await this.snapshot();
  const used=new Set(s.products.filter(p=>p.published).map(p=>p.categoryId));
  return {categories:s.categories.filter(c=>used.has(c.id)).map(c=>({...c,types:s.types.filter(t=>t.categoryId===c.id).map(t=>({id:t.id,name:t.name}))}))};
 }
 async product(id:string){try{return await this.reader.findProduct(id);}catch{throw catalogUnavailable();}}
 async offer(id:string){try{return await this.reader.findOffer(id);}catch{throw catalogUnavailable();}}
 async variant(id:string){
  const s=await this.snapshot(),v=s.variants.find(x=>x.id===id),p=v&&s.products.find(x=>x.id===v.productId);
  if(!v||!p?.published||!s.categories.some(c=>c.id===p.categoryId))throw catalogMissing();
  const offers=s.offers.filter(o=>o.variantId===v.id).map(o=>visibleOffer(s,o)).filter(o=>o!==null);
  return {product:{id:p.id,name:p.name,categoryId:p.categoryId,typeId:p.typeId,isDemo:p.isDemo},variant:{id:v.id,label:v.label},offers};
 }
}
