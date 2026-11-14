import {useCallback,useEffect,useMemo,useState} from "react";
import {mallRepository} from "../repositories/mall.repository.js";
import {floorCenter,indexMall,storeUnit,storesOnFloor} from "../models/map-document.js";
import {buildGraph} from "../models/pathfinding.js";
import {searchStores} from "../models/store-search.js";
import {isNetworkFailure} from "../../../shared/services/http-client.js";

/** Até 12×: o térreo da planta tem 361 m, e uma loja de 5 m precisa caber sob o marcador. */
export const ZOOM_MIN=0.6,ZOOM_MAX=12;
const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
const UNAVAILABLE="O mapa do shopping está indisponível no momento.";
const OFFLINE="Sem conexão. Verifique sua internet e tente novamente.";

function errorState(error){
 if(isNetworkFailure(error))return {status:"offline",message:OFFLINE};
 return {status:"error",message:error?.code==="MAP_INVALID"?"O mapa está temporariamente indisponível":UNAVAILABLE};
}

/** Carregamento, piso, zoom, deslocamento, seleção, busca e lista de lojas. */
export function useMallMapViewModel(){
 const [load,setLoad]=useState({status:"loading"});
 const [index,setIndex]=useState(null);
 const [floorId,setFloorId]=useState(null);
 const [zoom,setZoom]=useState(1);
 const [center,setCenter]=useState({x:0,y:0});
 const [selectedStoreId,setSelectedStoreId]=useState(null);
 const [query,setQuery]=useState("");
 const [listOpen,setListOpen]=useState(false);
 const [categoryId,setCategoryId]=useState(null);
 const [notice,setNotice]=useState(null);
 const [fit,setFit]=useState(null);

 const fetchMall=useCallback(async signal=>{
  setLoad({status:"loading"});
  try{
   const data=await mallRepository.load(signal);
   const next=indexMall(data);
   if(!next.floors.length)throw Object.assign(new Error(UNAVAILABLE),{code:"MAP_INVALID"});
   setIndex(next);setFloorId(next.floors[0].id);setCenter(floorCenter(next.floors[0]));setZoom(1);
   const first=next.floors[0];setFit(f=>({key:(f?.key??0)+1,floorId:first.id,bounds:[0,0,first.width,first.height],minSize:0}));
   setLoad({status:"ready"});
  }catch(error){if(error?.name!=="AbortError")setLoad(errorState(error));}
 },[]);
 useEffect(()=>{const abort=new AbortController();fetchMall(abort.signal);return()=>abort.abort();},[fetchMall]);
 const retry=useCallback(()=>{fetchMall();},[fetchMall]);

 const graph=useMemo(()=>index?buildGraph(index):null,[index]);
 const floor=index&&floorId?index.floorById.get(floorId):null;

 const showFloor=useCallback(id=>{
  if(index?.floorById.has(id))setFloorId(id);
 },[index]);
 const zoomBy=useCallback(factor=>setZoom(z=>clamp(z*factor,ZOOM_MIN,ZOOM_MAX)),[]);
 const panBy=useCallback((dx,dy)=>{
  if(!floor)return;
  setCenter(c=>({x:clamp(c.x+dx,0,floor.width),y:clamp(c.y+dy,0,floor.height)}));
 },[floor]);
 /** Pede ao FloorPlan para enquadrar a área [x0,y0,x1,y1] (metros) do piso, livre de banner e painel. */
 const fitTo=useCallback((targetFloorId,bounds,minSize=30)=>{
  setFloorId(targetFloorId);
  setFit(f=>({key:(f?.key??0)+1,floorId:targetFloorId,bounds,minSize}));
 },[]);
 const setView=useCallback(({zoom:z,center:c})=>{setZoom(clamp(z,ZOOM_MIN,ZOOM_MAX));setCenter(c);},[]);
 const focusOn=useCallback((targetFloorId,point)=>{
  if(point)fitTo(targetFloorId,[point[0],point[1],point[0],point[1]],60);else setFloorId(targetFloorId);
 },[fitTo]);

 const selectStore=useCallback(storeId=>{
  const store=index?.storeById.get(storeId);
  if(!store)return;
  setSelectedStoreId(storeId);setNotice(null);
  const unit=storeUnit(index,store);
  if(unit){
   const xs=unit.polygon.map(p=>p[0]),ys=unit.polygon.map(p=>p[1]);
   fitTo(unit.floorId,[Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)],60);
  }
 },[index,fitTo]);
 const clearSelection=useCallback(()=>setSelectedStoreId(null),[]);

 return {
  load,retry,index,graph,floor,floorId,showFloor,fitFloor:id=>{const f=index?.floorById.get(id);if(f)fitTo(id,[0,0,f.width,f.height],0);},zoom,zoomBy,center,panBy,focusOn,fit,fitTo,setView,
  markers:index&&floorId?storesOnFloor(index,floorId):[],
  selectedStore:selectedStoreId?index?.storeById.get(selectedStoreId)??null:null,
  selectStore,clearSelection,
  query,setQuery,suggestions:index?searchStores(index.stores,query):[],
  listOpen,openList:()=>{setListOpen(true);setSelectedStoreId(null);},closeList:()=>setListOpen(false),
  categoryId,setCategoryId,
  notice,setNotice,
 };
}
