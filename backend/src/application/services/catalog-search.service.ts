import {visibleOffer,type CatalogSnapshot,type PublicOffer} from "../../domain/catalog/catalog.ts";
import {relevance} from "../../domain/catalog/search.ts";
import {suggest} from "../../domain/catalog/suggestions.ts";
import {ApiError} from "../../presentation/http/errors/api-error.ts";
import type {CatalogReferenceService} from "./catalog-reference.service.ts";

type Filters={q?:unknown;categoryId?:unknown;typeId?:unknown;minPriceCents?:unknown;maxPriceCents?:unknown};
const invalid=()=>new ApiError(400,"INVALID_CATALOG_FILTER","Confira os filtros de busca.");
function string(v:unknown):string {if(v===undefined)return "";if(typeof v!=="string")throw invalid();return v.trim();}
function cents(v:unknown):number|null {
 if(v===undefined||v==="")return null;
 if(typeof v!=="string"||!/^\d+$/.test(v))throw invalid();
 const n=Number(v);if(!Number.isSafeInteger(n))throw invalid();return n;
}
const collator=new Intl.Collator("pt-BR",{sensitivity:"base",numeric:true});
const by=(a:string,b:string)=>collator.compare(a,b);
const stock={available:0,unavailable:1,unknown:2};
export class CatalogSearchService {
 readonly references:CatalogReferenceService;
 constructor(references:CatalogReferenceService){this.references=references;}
 async search(input:Filters){
  const q=string(input.q),categoryId=string(input.categoryId),typeId=string(input.typeId),
   min=cents(input.minPriceCents),max=cents(input.maxPriceCents);
  if(min!==null&&max!==null&&min>max)throw invalid();
  const s=await this.references.snapshot();
  if(categoryId&&!s.categories.some(c=>c.id===categoryId))throw invalid();
  if(typeId&&!s.types.some(t=>t.id===typeId&&(!categoryId||t.categoryId===categoryId)))throw invalid();
  const visible=s.offers.map(o=>visibleOffer(s,o)).filter((o):o is PublicOffer=>o!==null);
  const matched=visible.map(o=>({offer:o,rank:relevance(s,o,q)})).filter((x):x is {offer:PublicOffer;rank:number}=>x.rank!==null);
  const filtered=matched.filter(({offer:o})=>(!categoryId||o.product.categoryId===categoryId)&&(!typeId||o.product.typeId===typeId)&&
   (min===null&&max===null||o.priceCents!==null&&(min===null||o.priceCents>=min)&&(max===null||o.priceCents<=max)));
  filtered.sort((a,b)=>compare(s,a,b));
  const words=visible.flatMap(o=>[o.product.name,s.categories.find(c=>c.id===o.product.categoryId)?.label??"",
   ...s.synonyms.filter(x=>x.productId===o.product.id||x.categoryId===o.product.categoryId).map(x=>x.term)]);
  return {offers:filtered.map(x=>x.offer),suggestion:q&&!matched.length?suggest(q,words):null};
 }
}
function compare(s:CatalogSnapshot,a:{offer:PublicOffer;rank:number},b:{offer:PublicOffer;rank:number}):number {
 const x=a.offer,y=b.offer,group=stock[x.availability]-stock[y.availability];if(group)return group;
 if(x.availability!=="available")return by(x.store.name,y.store.name)||by(x.id,y.id);
 const rank=a.rank-b.rank;if(rank)return rank;
 const category=by(s.categories.find(c=>c.id===x.product.categoryId)?.label??"",s.categories.find(c=>c.id===y.product.categoryId)?.label??"");
 if(category)return category;
 const price=(x.priceCents??Infinity)-(y.priceCents??Infinity);if(!Number.isNaN(price)&&price)return price;
 return by(x.product.name,y.product.name)||by(x.store.name,y.store.name)||by(x.id,y.id);
}
