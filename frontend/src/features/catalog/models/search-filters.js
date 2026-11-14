export function parsePrice(value){
 const text=value.trim();if(!text)return null;
 if(!/^\d+(?:[.,]\d{1,2})?$/.test(text))throw new Error("Informe um preço válido com até dois centavos.");
 const [whole,fraction=""]=text.replace(",",".").split(".");
 const cents=Number(whole)*100+Number(fraction.padEnd(2,"0"));
 if(!Number.isSafeInteger(cents))throw new Error("Informe um preço válido.");
 return cents;
}
export function buildFilters(draft,categories){
 const min=parsePrice(draft.minPrice),max=parsePrice(draft.maxPrice);
 if(min!==null&&max!==null&&min>max)throw new Error("O preço mínimo não pode ser maior que o máximo.");
 if(draft.typeId&&draft.categoryId&&!categories.find(c=>c.id===draft.categoryId)?.types.some(t=>t.id===draft.typeId))
  throw new Error("O tipo não pertence à categoria escolhida.");
 return {q:draft.q.trim(),categoryId:draft.categoryId,typeId:draft.typeId,minPriceCents:min,maxPriceCents:max};
}
