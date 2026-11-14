import type {CatalogReader,CatalogProduct,CatalogOffer,CatalogReference} from "../../application/ports/catalog-reader.ts";
import type {CatalogRepository} from "../../application/ports/catalog-repository.ts";
import {visibleOffer} from "../../domain/catalog/catalog.ts";

export class SupabaseCatalogReader implements CatalogReader {
 search:(term:string)=>Promise<CatalogProduct[]> = async()=>{throw new Error("Busca de catálogo indisponível");};
 private readonly repo:CatalogRepository;
 constructor(repo:CatalogRepository){this.repo=repo;}
 async findProduct(id:string):Promise<CatalogReference<CatalogProduct>> {
  const s=await this.repo.snapshot(),p=s.products.find(item=>item.id===id);
  if(!p)return {status:"missing"};
  if(!p.published||!s.categories.some(c=>c.id===p.categoryId))return {status:"unavailable"};
  return {status:"found",item:{id:p.id,name:p.name,isDemo:p.isDemo||Boolean(s.mall?.isDemo)}};
 }
 async findOffer(id:string):Promise<CatalogReference<CatalogOffer>> {
  const s=await this.repo.snapshot(),o=s.offers.find(item=>item.id===id);
  if(!o)return {status:"missing"};
  const v=visibleOffer(s,o);if(!v)return {status:"unavailable"};
  return {status:"found",item:{id:v.id,productId:v.product.id,store:{id:v.store.id,name:v.store.name},
   priceCents:v.priceCents,availability:v.availability,isDemo:v.isDemo}};
 }
 searchProducts(term:string){return this.search(term);}
}
