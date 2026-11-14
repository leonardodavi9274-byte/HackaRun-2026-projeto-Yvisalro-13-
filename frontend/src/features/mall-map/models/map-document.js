/**
 * Leitura do documento do mapa (schemaVersion 1, metros, eixo y para baixo) e das lojas
 * devolvidas por GET /api/v1/mall. Funções puras, sem React.
 */
export function indexMall(data){
 const document=data.map.document;
 const floors=[...document.floors].sort((a,b)=>a.order-b.order);
 const floorById=new Map(floors.map(f=>[f.id,f]));
 const unitById=new Map(),nodeById=new Map(),pointById=new Map();
 for(const floor of floors){
  for(const unit of floor.units)unitById.set(unit.id,{...unit,floorId:floor.id});
  for(const node of floor.nodes)nodeById.set(node.id,{...node,floorId:floor.id});
  for(const point of floor.points)pointById.set(point.id,{...point,floorId:floor.id});
 }
 const stores=data.stores.map(store=>{
  const unit=store.unitId?unitById.get(store.unitId):null;
  return {...store,floorId:unit?unit.floorId:null,positioned:Boolean(unit)};
 });
 const storeById=new Map(stores.map(s=>[s.id,s]));
 const storeByUnit=new Map(stores.filter(s=>s.positioned).map(s=>[s.unitId,s]));
 const storeByDoor=new Map(stores.filter(s=>s.positioned).map(s=>[unitById.get(s.unitId).door,s]));
 return {mall:data.mall,map:data.map,floors,floorById,unitById,nodeById,pointById,edges:document.edges,stores,storeById,storeByUnit,storeByDoor};
}

export const floorName=(index,floorId)=>index.floorById.get(floorId)?.name??"";
export const storesOnFloor=(index,floorId)=>index.stores.filter(s=>s.positioned&&s.floorId===floorId);
export const storeUnit=(index,store)=>store?.positioned?index.unitById.get(store.unitId):null;
export const pointNode=(index,pointId)=>{const point=index.pointById.get(pointId);return point?index.nodeById.get(point.node):null;};
export const floorCenter=floor=>({x:floor.width/2,y:floor.height/2});

/** Nome acessível do marcador: "{loja}, {categoria}, Piso {n}". */
export const storeAccessibleName=(index,store)=>`${store.name}, ${store.category.label}, ${store.positioned?floorName(index,store.floorId):"Localização no mapa indisponível"}`;

export const initials=name=>name.split(/\s+/).filter(w=>w.length>2||/^[A-ZÀ-Ý]/.test(w)).slice(0,2).map(w=>w[0].toLocaleUpperCase("pt-BR")).join("")||name.slice(0,2).toLocaleUpperCase("pt-BR");
