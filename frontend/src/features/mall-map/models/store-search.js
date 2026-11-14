/** Normaliza sem acento e sem caixa: "Café" e "cafe" coincidem. */
export const normalize=value=>String(value??"").normalize("NFD").replace(/\p{M}/gu,"").toLocaleLowerCase("pt-BR").trim();

/** Busca por nome e categoria; até 8 sugestões por padrão. */
export function searchStores(stores,query,limit=8){
 const q=normalize(query);if(!q)return [];
 return stores.filter(s=>normalize(s.name).includes(q)||normalize(s.category.label).includes(q)).slice(0,limit);
}

export const filterByCategory=(stores,categoryId)=>categoryId?stores.filter(s=>s.category.id===categoryId):stores;

export function categoriesOf(stores){
 const map=new Map();for(const s of stores)map.set(s.category.id,s.category);
 return [...map.values()].sort((a,b)=>a.label.localeCompare(b.label,"pt-BR"));
}
