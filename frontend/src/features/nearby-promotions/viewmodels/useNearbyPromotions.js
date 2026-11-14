import {useEffect,useRef,useState} from "react";
import {useOptionalActiveRoute} from "../../mall-map/viewmodels/ActiveRouteProvider.jsx";
import {mallRepository} from "../../mall-map/repositories/mall.repository.js";
import {indexMall} from "../../mall-map/models/map-document.js";
import {promotionRepository} from "../repositories/promotion.repository.js";
import {selectPromotions} from "../models/select-promotion.js";
import {usePromotionSession} from "./PromotionSessionProvider.jsx";

/** Um hook por visita ao Início. Respostas assíncronas nunca autorizam exibição após troca de contexto. */
export function useNearbyPromotions({ownerId,categoryIds,profileReady}){
 const route=useOptionalActiveRoute(),session=usePromotionSession(ownerId);
 const [visible,setVisible]=useState(null);
 const point=route?.promotionPoint;
 const pointKey=point?JSON.stringify([point.ownerId,point.mallId,point.mapVersion,point.pointId]):"";
 const categoryKey=JSON.stringify(categoryIds??[]);
 const allowed=Boolean(ownerId&&profileReady&&point&&point.ownerId===ownerId&&route?.isActive===false);
 const generation=useRef({base:null,serial:0});
 const base=JSON.stringify([ownerId,pointKey,categoryKey,route?.isActive??null,profileReady,session.visit]);
 if(generation.current.base!==base)generation.current={base,serial:generation.current.serial+1};
 const contextKey=JSON.stringify([base,generation.current.serial]);
 const current=useRef(null);current.current={allowed,contextKey,session,routeActive:route?.isActive!==false};

 useEffect(()=>{
  if(!allowed||session.shown){return;}
  const abort=new AbortController(),key=contextKey;
  (async()=>{
   try{
    const [data,response]=await Promise.all([mallRepository.load(abort.signal),promotionRepository.list(point.mallId,abort.signal)]);
    if(abort.signal.aborted||!current.current.allowed||current.current.contextKey!==key||response.mallId!==point.mallId)return;
    const index=indexMall(data),candidates=selectPromotions(index,point,response.offers,JSON.parse(categoryKey),session.dismissed);
    const candidate=candidates[0];if(!candidate)return;
    const confirmation=await promotionRepository.confirm(point.mallId,candidate.offer,abort.signal);
    const latestMap=await mallRepository.load(abort.signal);
    if(abort.signal.aborted||!current.current.allowed||current.current.contextKey!==key||session.shown||session.dismissed.has(candidate.offer.id))return;
    if(confirmation.offer.id!==candidate.offer.id||confirmation.offer.revision!==candidate.offer.revision)return;
    if(confirmation.offer.endsAt&&Date.parse(confirmation.offer.endsAt)<=Date.now())return;
    const latest=selectPromotions(indexMall(latestMap),point,[confirmation.offer],JSON.parse(categoryKey),session.dismissed)[0];
    if(!latest)return;
    session.shown=true;setVisible({...latest,offer:confirmation.offer,contextKey:key,locationMissing:false});
   }catch(error){if(!abort.signal.aborted&&current.current.contextKey===key&&error?.name!=="AbortError")setVisible(null);}
  })();
  return()=>abort.abort();
 },[allowed,contextKey,pointKey,categoryKey,session]);

 const displayed=allowed&&visible?.contextKey===contextKey?visible:null;
 useEffect(()=>{
  if(!displayed)return;
  let disposed=false,controller=null;
  const refresh=async()=>{
   controller?.abort();const request=new AbortController();controller=request;
   try{
    const [data,result]=await Promise.all([mallRepository.load(request.signal),promotionRepository.confirm(point.mallId,displayed.offer,request.signal)]);
    if(disposed||request.signal.aborted||!current.current.allowed||current.current.contextKey!==contextKey)return;
    const index=indexMall(data);
    if(index.mall.id!==point.mallId||index.map.versionLabel!==point.mapVersion||!index.pointById.has(point.pointId)){setVisible(null);return;}
    const store=index.storeById.get(displayed.offer.storeId);
    if(!store?.positioned){setVisible(old=>old?{...old,locationMissing:true}:null);return;}
    const selected=selectPromotions(index,point,[result.offer],JSON.parse(categoryKey),new Set())[0];
    if(!selected){setVisible(null);return;}
    setVisible(old=>old?{...selected,offer:result.offer,contextKey,locationMissing:false}:null);
   }catch(error){if(!disposed&&!request.signal.aborted&&error?.name!=="AbortError")setVisible(null);}
  };
  const interval=setInterval(refresh,30000);
  const focus=()=>refresh();window.addEventListener("focus",focus);
  const remaining=displayed.offer.endsAt?Date.parse(displayed.offer.endsAt)-Date.now():null;
  const expiry=remaining!==null?setTimeout(refresh,Math.max(0,Math.min(remaining+50,2147483647))):null;
  return()=>{disposed=true;controller?.abort();clearInterval(interval);if(expiry!==null)clearTimeout(expiry);window.removeEventListener("focus",focus);};
 },[displayed?.offer.id,displayed?.offer.revision,displayed?.offer.endsAt,contextKey,pointKey,categoryKey]);

 function dismiss(){if(displayed)session.dismissed.add(displayed.offer.id);setVisible(null);}
 function close(){setVisible(null);}
 return {promotion:displayed,dismiss,close,canRestoreFocus:()=>!current.current.routeActive&&location.pathname==="/inicio"};
}
