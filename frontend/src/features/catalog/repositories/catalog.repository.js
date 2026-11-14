import {getJson} from "../../../shared/services/http-client.js";
const encoded=id=>encodeURIComponent(id);
function query(params){
 const p=new URLSearchParams();
 for(const [key,value] of Object.entries(params||{}))if(value!==undefined&&value!==null&&value!=="")p.set(key,String(value));
 const result=p.toString();return result?"?"+result:"";
}
export const catalogRepository={
 categories:(options={})=>getJson("/catalog/categories",options),
 search:(params={},options={})=>getJson("/catalog/offers"+query(params),options),
 variant:(id,options={})=>getJson("/catalog/variants/"+encoded(id),options),
 similar:(id,options={})=>getJson("/catalog/variants/"+encoded(id)+"/similar",options),
 findProduct:(id,options={})=>getJson("/catalog/products/"+encoded(id),options),
 findOffer:(id,options={})=>getJson("/catalog/offers/"+encoded(id),options),
 async searchProducts(term,options={}){
  const data=await this.search({q:term},options), seen=new Set();
  return data.offers.filter(o=>{if(seen.has(o.product.id))return false;seen.add(o.product.id);return true;})
   .map(o=>({id:o.product.id,name:o.product.name,isDemo:o.isDemo}));
 }
};
