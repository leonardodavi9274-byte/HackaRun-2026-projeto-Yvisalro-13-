import {useEffect,useRef} from "react";
import {useMallMapViewModel} from "../viewmodels/useMallMapViewModel.js";
import {useRouteViewModel} from "../viewmodels/useRouteViewModel.js";
import {useLocationViewModel} from "../viewmodels/useLocationViewModel.js";
import {floorName,storeAccessibleName,storeUnit} from "../models/map-document.js";
import {useSearchParam} from "../../../app/navigation.js";
import {FormFeedback} from "../../../shared/components/FormFeedback.jsx";
import {BottomNav} from "../../../shared/components/BottomNav.jsx";
import {Icon} from "../../../shared/components/Icon.jsx";
import {FloorPlan} from "./FloorPlan.jsx";
import {StoreMarker} from "./StoreMarker.jsx";
import {FloorSelector} from "./FloorSelector.jsx";
import {ZoomControls} from "./ZoomControls.jsx";
import {MapSearch} from "./MapSearch.jsx";
import {StoreDetailsSheet} from "./StoreDetailsSheet.jsx";
import {StoreListView} from "./StoreListView.jsx";
import {StartPointPicker} from "./StartPointPicker.jsx";
import {RouteBanner} from "./RouteBanner.jsx";
import {RouteSheet} from "./RouteSheet.jsx";
import {ReplaceRouteDialog} from "./ReplaceRouteDialog.jsx";
import {LocationNotice} from "./LocationNotice.jsx";
import {NearbyPanel} from "./NearbyPanel.jsx";
import "../../../styles/registration.css";
import "../../../styles/mall-map.css";

/** Nome e logo com até 70 m visíveis; marcador compacto acima de 140 m visíveis. */
const DETAIL_MAX_M=70,COMPACT_MIN_M=140;

const NOT_FOUND="Loja não encontrada no mapa";

const boundsOf=points=>{
 const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);
 return [Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)];
};

/** Partes do mapa cobertas pela barra superior e pelo painel (px), para enquadrar só a área livre. */
function coveredInsets(planElement){
 const plan=planElement?.getBoundingClientRect();
 if(!plan)return {};
 const page=planElement.closest(".mall-page"),top=page?.querySelector(".map-top")?.getBoundingClientRect();
 const panel=page?.querySelector(".mall-panel")?.getBoundingClientRect();
 const insets={top:top?Math.max(0,top.bottom-plan.top+8):0,bottom:0,left:0,right:0};
 const controls=page?.querySelector(".floor-selector")?.getBoundingClientRect();
 if(controls&&controls.left>plan.left+plan.width/2)insets.right=Math.max(0,plan.right-controls.left+8);
 if(panel&&panel.left<=plan.left+1&&panel.right>=plan.right-1)insets.bottom=Math.max(0,plan.bottom-panel.top);
 else if(panel&&panel.top<=plan.top+1&&panel.right>plan.left)insets.left=Math.max(0,panel.right-plan.left);
 return insets;
}

/** Marcador em px de tela: com muitos marcadores próximos, mantém só o primeiro (prioridade) de cada vizinhança. */
function withoutOverlaps(items,minDistancePx){
 const kept=[];
 for(const item of items)if(!kept.some(k=>Math.hypot(k.px[0]-item.px[0],k.px[1]-item.px[1])<minDistancePx))kept.push(item);
 return kept;
}

/** Página /mapa (telas 09 e 10). Pública: não depende da sessão. */
export function MallMapView({ownerId}){
 const map=useMallMapViewModel();
 const routing=useRouteViewModel(map.index,map.graph,ownerId);
 const location=useLocationViewModel(map.index?.mall);
 const storeParam=useSearchParam("loja");
 const handledParam=useRef(null);
 const {route}=routing;

 // US5: /mapa?loja={storeId} pré-seleciona a loja como destino e segue para "Onde você está?".
 useEffect(()=>{
  if(map.load.status!=="ready"||!storeParam||handledParam.current===storeParam)return;
  handledParam.current=storeParam;
  const store=map.index.storeById.get(storeParam);
  if(!store?.positioned){map.clearSelection();map.setNotice(NOT_FOUND);return;}
  map.closeList();map.selectStore(store.id);
  if(routing.isActive)routing.requestRoute(store.id);else routing.openPicker(store.id);
 },[map.load.status,storeParam]);

 // O mapa acompanha a rota: no 1º passo mostra o trajeto inteiro do piso; depois, o trecho do passo
 // atual (incluindo a troca de piso); na chegada, a loja. Sempre na área não coberta pelo painel.
 useEffect(()=>{
  if(!route||!map.index)return;
  const index=map.index;
  if(route.arrived){
   const unit=index.unitById.get(index.storeById.get(route.storeId)?.unitId);
   if(unit)map.fitTo(unit.floorId,boundsOf(unit.polygon),50);else map.showFloor(route.arrivalFloorId);
   return;
  }
  const step=route.instructions[route.stepIndex];
  const [from,to]=route.stepIndex===0?[0,route.nodes.length-1]:[step.fromIndex,step.toIndex];
  const points=route.nodes.slice(from,to+1).map(id=>index.nodeById.get(id)).filter(n=>n?.floorId===step.floorId).map(n=>[n.x,n.y]);
  if(points.length)map.fitTo(step.floorId,boundsOf(points),35);else map.showFloor(step.floorId);
 },[route]);

 if(map.load.status!=="ready")return <main className="mall-page"><div className="mall-state">
  {map.load.status==="loading"?<p role="status">Carregando o mapa…</p>
  :<FormFeedback message={map.load.message}><button type="button" className="text-button" onClick={map.retry}>Tentar novamente</button></FormFeedback>}
 </div><BottomNav current="/mapa"/></main>;

 const {index,floor}=map;
 const floorNameOf=id=>floorName(index,id);
 const destinationUnit=route?index.unitById.get(index.storeById.get(route.storeId)?.unitId):storeUnit(index,map.selectedStore);
 const destinationId=route?route.storeId:map.selectedStore?.id;
 const startNode=routing.startPoint?index.nodeById.get(routing.startPoint.node):null;
 const picking=Boolean(routing.picking);

 function selectFromMap(storeId){
  if(routing.isActive){routing.requestRoute(storeId);return;}
  map.closeList();map.selectStore(storeId);
 }
 function endRoute(keepDestination){
  const destination=route?.storeId;
  routing.end();
  if(keepDestination&&destination)map.selectStore(destination);else map.clearSelection();
 }

 let panel;
 if(picking)panel=<StartPointPicker index={index} destination={routing.picking.storeId?index.storeById.get(routing.picking.storeId):null}
  currentPointId={routing.startPoint?.id} error={routing.error} onChoose={routing.chooseStart} onCancel={routing.cancelPicking}/>;
 else if(route)panel=<RouteSheet route={route} startPoint={routing.startPoint} floorNameOf={floorNameOf} error={routing.error}
  onPrevious={routing.previous} onNext={routing.next} onEnd={()=>endRoute(false)} onBackToMap={()=>endRoute(true)} onChangeStart={()=>routing.openPicker(null)}/>;
 else if(map.listOpen)panel=<StoreListView index={index} categoryId={map.categoryId} onCategory={map.setCategoryId}
  onShow={id=>{map.closeList();map.selectStore(id);}} onRoute={id=>{map.closeList();map.selectStore(id);routing.requestRoute(id);}} onClose={map.closeList}/>;
 else if(map.selectedStore)panel=<StoreDetailsSheet store={map.selectedStore} floorLabel={floorNameOf(map.selectedStore.floorId)}
  onRoute={routing.requestRoute} onClose={map.clearSelection}/>;
 else panel=<div className="mall-sheet">
  <FormFeedback message={map.notice} tone="info"><button type="button" className="text-button" onClick={()=>map.setNotice(null)}>Fechar aviso</button></FormFeedback>
  <NearbyPanel startPoint={routing.startPoint} items={routing.nearby} floorNameOf={floorNameOf}
   onChooseStart={()=>routing.openPicker(null)} onSelect={map.selectStore} onRoute={id=>{map.selectStore(id);routing.requestRoute(id);}}/>
  <LocationNotice mall={index.mall} location={location} onChooseStart={()=>routing.openPicker(null)}/>
  <button type="button" className="secondary-button mall-full" onClick={map.openList}><Icon name="list" size={18}/>Ver lista de lojas</button>
 </div>;

 return <main className="mall-page">
  <div className="mall-body">
   <div className="mall-map-area">
    <FloorPlan index={index} floor={floor} zoom={map.zoom} center={map.center} onPan={map.panBy} onZoom={map.zoomBy}
     onView={map.setView} fit={map.fit} getInsets={coveredInsets}
     selectedUnitId={destinationUnit?.id} route={route} label={`Mapa do ${index.mall.name}, ${floor.name}`}>
     {(project,vb,size)=>{
      const visible=([x,y])=>x>=vb.x&&x<=vb.x+vb.w&&y>=vb.y&&y<=vb.y+vb.h;
      // Detalhe pela largura visível em metros, não pelo zoom: a planta tem pisos de 117 m a 361 m.
      const detailed=vb.w<=DETAIL_MAX_M,compact=vb.w>COMPACT_MIN_M;
      const toPx=([x,y])=>[(x-vb.x)/vb.w*size.w,(y-vb.y)/vb.h*size.h];
      // Destino primeiro; marcadores sobrepostos na tela são omitidos (a unidade continua colorida
      // e a loja segue disponível na busca e na lista).
      const candidates=map.markers.filter(store=>visible(index.unitById.get(store.unitId).anchor))
       .map(store=>({store,px:toPx(index.unitById.get(store.unitId).anchor)}))
       .sort((a,b)=>(b.store.id===destinationId)-(a.store.id===destinationId));
      const shown=withoutOverlaps(candidates,detailed?72:compact?38:52);
      return <>
       {shown.map(({store})=>{
        const unit=index.unitById.get(store.unitId);
        return <StoreMarker key={store.id} store={store} accessibleName={storeAccessibleName(index,store)} style={project(unit.anchor)}
         selected={store.id===destinationId} showLogo={detailed} showName={detailed} compact={compact} onSelect={selectFromMap}/>;
       })}
       {picking&&floor.points.filter(p=>visible([index.nodeById.get(p.node).x,index.nodeById.get(p.node).y])).map(point=>{
        const node=index.nodeById.get(point.node);
        return <button type="button" key={point.id} className="start-point-button" style={project([node.x,node.y])}
         aria-label={`Partir de ${point.label}, ${floor.name}`} onClick={()=>routing.chooseStart(point.id)}>{point.label}</button>;
       })}
       {!picking&&startNode?.floorId===floor.id&&<div className="start-marker" style={project([startNode.x,startNode.y])}>
        <span className="start-dot" aria-hidden="true"/><span className="start-label">Partida: {routing.startPoint.label}</span>
       </div>}
      </>;
     }}
    </FloorPlan>
    <div className="map-top">
     {route&&!picking?<RouteBanner route={route} instruction={routing.instruction}/>:<>
      <MapSearch query={map.query} onQuery={map.setQuery} suggestions={map.suggestions} floorNameOf={floorNameOf}
       onSelect={id=>{map.closeList();if(routing.isActive)routing.requestRoute(id);else map.selectStore(id);}}/>
      <div className="map-badges">
       <span className="mall-badge">{index.mall.name}</span>
       {index.mall.isDemo&&<span className="demo-badge">Mapa de demonstração</span>}
      </div>
     </>}
    </div>
    <div className="map-controls">
     <FloorSelector floors={index.floors} activeId={floor.id} onSelect={map.fitFloor}/>
     <ZoomControls zoom={map.zoom} onZoom={map.zoomBy}/>
     <p className="floor-caption" aria-live="polite">{floor.name} selecionado</p>
    </div>
   </div>
   <aside className="mall-panel" aria-label="Painel do mapa">{panel}</aside>
  </div>
  {routing.confirm&&<ReplaceRouteDialog storeName={index.storeById.get(routing.confirm.storeId)?.name}
   startLabel={index.pointById.get(routing.confirm.pointId)?.label} onReplace={routing.confirmReplace} onKeep={routing.keepRoute}/>}
  <BottomNav current="/mapa"/>
 </main>;
}
