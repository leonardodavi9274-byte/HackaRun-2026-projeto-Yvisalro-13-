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

const NOT_FOUND="Loja não encontrada no mapa";

/** Página /mapa (telas 09 e 10). Pública: não depende da sessão. */
export function MallMapView(){
 const map=useMallMapViewModel();
 const routing=useRouteViewModel(map.index,map.graph);
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

 // O mapa acompanha o piso da instrução atual (troca de piso na conexão).
 useEffect(()=>{
  if(!route)return;
  map.showFloor(route.arrived?route.arrivalFloorId:route.instructions[route.stepIndex].floorId);
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
     selectedUnitId={destinationUnit?.id} route={route} label={`Mapa do ${index.mall.name}, ${floor.name}`}>
     {(project,vb)=>{
      const visible=([x,y])=>x>=vb.x&&x<=vb.x+vb.w&&y>=vb.y&&y<=vb.y+vb.h;
      return <>
       {map.markers.filter(store=>visible(index.unitById.get(store.unitId).anchor)).map(store=>{
        const unit=index.unitById.get(store.unitId);
        return <StoreMarker key={store.id} store={store} accessibleName={storeAccessibleName(index,store)} style={project(unit.anchor)}
         selected={store.id===destinationId} showLogo={map.zoom>=2} showName={map.zoom>=2} onSelect={selectFromMap}/>;
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
     <FloorSelector floors={index.floors} activeId={floor.id} onSelect={map.showFloor}/>
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
