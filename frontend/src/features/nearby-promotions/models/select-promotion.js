import {buildGraph,distancesFrom} from "../../mall-map/models/pathfinding.js";
const collator=new Intl.Collator("pt-BR");
export function selectPromotions(index,pointContext,offers,categoryIds,dismissed){
 if(!index||!pointContext||pointContext.mallId!==index.mall.id||pointContext.mapVersion!==index.map.versionLabel)return [];
 const point=index.pointById.get(pointContext.pointId);
 if(!point)return [];
 const distances=distancesFrom(buildGraph(index),point.node),interests=new Set(categoryIds);
 return offers.flatMap(offer=>{
  const store=index.storeById.get(offer.storeId),unit=store?.positioned?index.unitById.get(store.unitId):null;
  const distanceM=unit?distances.get(unit.door):undefined;
  if(dismissed.has(offer.id)||!store||!unit||store.floorId!==point.floorId||distanceM===undefined||distanceM>100)return [];
  if(!offer.id||!offer.productName||!Number.isSafeInteger(offer.priceCents)||offer.priceCents<0||offer.availability!=="available"||!Number.isSafeInteger(offer.revision)||offer.revision<1)return [];
  return [{offer,store,distanceM,interestMatch:interests.has(offer.categoryId),floorName:index.floorById.get(store.floorId)?.name??store.floorId,mapIsDemo:index.mall.isDemo}];
 }).sort((a,b)=>Number(b.interestMatch)-Number(a.interestMatch)||a.distanceM-b.distanceM||collator.compare(a.store.name,b.store.name)||collator.compare(a.offer.productName,b.offer.productName)||collator.compare(a.offer.id,b.offer.id));
}
