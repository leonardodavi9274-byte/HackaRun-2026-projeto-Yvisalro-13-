import type {CatalogSnapshot,PublicOffer} from "./catalog.ts";
export const normalizeSearch=(value:string)=>value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase("pt-BR").trim();
export function relevance(snapshot:CatalogSnapshot,offer:PublicOffer,term:string):number|null {
 const q=normalizeSearch(term);if(!q)return 0;
 if(normalizeSearch(offer.product.name).includes(q))return 0;
 if(snapshot.synonyms.some(s=>(s.productId===offer.product.id||s.categoryId===offer.product.categoryId)&&normalizeSearch(s.term).includes(q)))return 1;
 const category=snapshot.categories.find(c=>c.id===offer.product.categoryId);
 return category&&normalizeSearch(category.label).includes(q)?2:null;
}
