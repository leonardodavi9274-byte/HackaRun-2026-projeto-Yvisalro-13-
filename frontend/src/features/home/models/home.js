// Modelo do agregado público GET /api/v1/home (contracts/api.md).
// Não completa dados ausentes: campos desconhecidos ficam null e a interface os omite.
export const HOME_LIMITS=Object.freeze({categories:12,stories:10,featuredOffers:8,carousels:6,carouselProducts:10});
export const SECTION_STATUS=Object.freeze({loading:"loading",ready:"ready",empty:"empty",unavailable:"unavailable"});
const SECTIONS=["categories","stories","featuredOffers","carousels"];
const LIMIT_BY_SECTION={categories:HOME_LIMITS.categories,stories:HOME_LIMITS.stories,featuredOffers:HOME_LIMITS.featuredOffers,carousels:HOME_LIMITS.carousels};
const STOCK=new Set(["in_stock","out_of_stock","unknown"]);

const text=v=>typeof v==="string"&&v.trim()?v:null;
const cents=v=>Number.isInteger(v)&&v>0?v:null;
const date=v=>text(v)&&!Number.isNaN(Date.parse(v))?v:null;

function product(p){if(!p||!text(p.id)||!text(p.name))return null;const imageUrl=text(p.imageUrl),imageAlt=imageUrl?text(p.imageAlt):null;return {id:p.id,name:p.name,imageUrl:imageAlt?imageUrl:null,imageAlt};}
function store(s){if(!s||!text(s.id)||!text(s.name))return null;return {id:s.id,name:s.name,floorLabel:text(s.floorLabel)};}
export function offer(o){
 const p=product(o?.product),s=store(o?.store),price=cents(o?.priceCents);
 if(!o||!text(o.offerId)||!p||!s||!price||o.currency!=="BRL")return null;
 const previous=cents(o.previousPriceCents);
 return {offerId:o.offerId,product:p,store:s,priceCents:price,currency:"BRL",previousPriceCents:previous&&previous>price?previous:null,stockStatus:STOCK.has(o.stockStatus)?o.stockStatus:"unknown",validUntil:date(o.validUntil),lastUpdatedAt:date(o.lastUpdatedAt),isDemo:o.isDemo===true};
}
const category=c=>c&&text(c.id)&&text(c.label)?{id:c.id,label:c.label,isDemo:c.isDemo===true}:null;
function story(s){const st=store(s?.store);if(!s||!text(s.id)||!text(s.title)||!st)return null;const imageUrl=text(s.imageUrl),imageAlt=text(s.imageAlt);return {id:s.id,title:s.title,imageUrl:imageAlt?imageUrl:null,imageAlt:imageUrl?imageAlt:null,store:st,offer:offer(s.offer),validUntil:date(s.validUntil),isDemo:s.isDemo===true};}
function carousel(c){
 if(!c||!text(c.id)||!text(c.title)||!Array.isArray(c.products))return null;
 const seen=new Set(),products=[];
 for(const item of c.products){const p=product(item?.product);if(!p||seen.has(p.id))continue;seen.add(p.id);products.push({product:p,offer:offer(item.offer),isDemo:item.isDemo===true});if(products.length===HOME_LIMITS.carouselProducts)break;}
 return products.length?{id:c.id,title:c.title,isDemo:c.isDemo===true||products.some(p=>p.isDemo),products}:null;
}
const PARSERS={categories:category,stories:story,featuredOffers:offer,carousels:carousel};
const keyOf={categories:i=>i.id,stories:i=>i.id,featuredOffers:i=>i.offerId,carousels:i=>i.id};

function section(name,raw){
 if(!raw||!["ready","empty","unavailable"].includes(raw.status)||!Array.isArray(raw.items))return {status:SECTION_STATUS.unavailable,items:[]};
 if(raw.status==="unavailable")return {status:SECTION_STATUS.unavailable,items:[]};
 const seen=new Set(),items=[];
 for(const entry of raw.items){const item=PARSERS[name](entry);if(!item||seen.has(keyOf[name](item)))continue;seen.add(keyOf[name](item));items.push(item);if(items.length===LIMIT_BY_SECTION[name])break;}
 return {status:items.length?SECTION_STATUS.ready:SECTION_STATUS.empty,items};
}

export function createHomeContent(data){
 if(!data||typeof data!=="object"||!data.sections||!date(data.generatedAt))throw new Error("O serviço retornou uma tela inicial inesperada.");
 const shopping=data.shopping&&text(data.shopping.id)&&text(data.shopping.name)?{id:data.shopping.id,name:data.shopping.name,isDemo:data.shopping.isDemo===true}:null;
 return Object.freeze({generatedAt:data.generatedAt,shopping,sections:Object.fromEntries(SECTIONS.map(name=>[name,section(name,data.sections[name])]))});
}
export const loadingSections=()=>Object.fromEntries(SECTIONS.map(name=>[name,{status:SECTION_STATUS.loading,items:[]}]));

// Relógio de referência: generatedAt do servidor + tempo decorrido desde o carregamento.
export const createClock=(generatedAt,loadedAt=Date.now())=>{const offset=Date.parse(generatedAt)-loadedAt;return ()=>Date.now()+offset;};
export const isExpired=(validUntil,now)=>Boolean(validUntil&&Date.parse(validUntil)<=now);

const brl=new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"});
export const formatMoney=c=>brl.format(c/100);
export const discountPercent=(price,previous)=>previous&&previous>price?Math.round((1-price/previous)*100):null;
const dateFormat=new Intl.DateTimeFormat("pt-BR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"});
export const formatDateTime=v=>dateFormat.format(new Date(v));
export const stockLabel=s=>s==="in_stock"?"Em estoque":s==="out_of_stock"?"Sem estoque":"Estoque não informado";
export const storeLabel=s=>s.floorLabel?s.name+" · "+s.floorLabel:s.name;
