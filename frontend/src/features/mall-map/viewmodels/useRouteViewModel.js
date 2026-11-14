import {useMemo,useState} from "react";
import {useActiveRoute} from "./ActiveRouteProvider.jsx";
import {buildRoute} from "../models/instructions.js";
import {nearestStores} from "../models/pathfinding.js";

export const NO_PATH="Não foi possível traçar um caminho até esta loja";

/**
 * Ponto de partida (sempre escolhido pela pessoa), cálculo da rota, passos, chegada,
 * encerramento, substituição com confirmação e lojas próximas.
 * Transições: consulta → escolhendo-partida → ativa → chegou → consulta.
 */
export function useRouteViewModel(index,graph,ownerId){
 const active=useActiveRoute();
 const [picking,setPicking]=useState(null);
 const [confirm,setConfirm]=useState(null);
 const [error,setError]=useState(null);

 function compute(pointId,storeId){
  const route=index&&graph?buildRoute(index,graph,{startPointId:pointId,storeId}):null;
  if(!route){setError(NO_PATH);return false;}
  active.setStartPointId(pointId,{mallId:index.mall.id,mapVersion:index.map.versionLabel,ownerId});
  if(active.isActive)active.replace(route);else active.start(route);
  setPicking(null);setError(null);
  return true;
 }

 function requestRoute(storeId){
  setError(null);
  const store=index?.storeById.get(storeId);
  if(!store?.positioned)return;
  if(active.isActive){
   if(active.route.storeId!==storeId)setConfirm({storeId,pointId:active.startPointId});
   return;
  }
  if(active.startPointId&&compute(active.startPointId,storeId))return;
  setPicking({storeId});
 }

 function chooseStart(pointId){
  if(picking?.storeId){
   compute(pointId,picking.storeId);
   return;
  }
  if(active.isActive){
   setPicking(null);
   if(pointId!==active.startPointId)setConfirm({storeId:active.route.storeId,pointId});
   return;
  }
  active.setStartPointId(pointId,{mallId:index.mall.id,mapVersion:index.map.versionLabel,ownerId});setPicking(null);setError(null);
 }

 function confirmReplace(){
  if(!confirm)return;
  const {storeId,pointId}=confirm;
  setConfirm(null);
  compute(pointId,storeId);
 }

 const nearby=useMemo(()=>{
  const point=active.startPointId&&index?.pointById.get(active.startPointId);
  return point&&graph?nearestStores(index,graph,point.node,5):[];
 },[index,graph,active.startPointId]);

 const route=active.route;
 const instruction=route&&!route.arrived?route.instructions[route.stepIndex]:null;
 return {
  route,isActive:active.isActive,instruction,
  startPoint:active.startPointId?index?.pointById.get(active.startPointId)??null:null,
  picking,openPicker:(storeId=null)=>{setError(null);setPicking({storeId});},
  cancelPicking:()=>{setPicking(null);setError(null);},
  requestRoute,chooseStart,
  next:active.next,previous:active.previous,
  end:()=>{active.end();setError(null);},
  confirm,confirmReplace,keepRoute:()=>setConfirm(null),
  error,clearError:()=>setError(null),
  nearby,
 };
}
