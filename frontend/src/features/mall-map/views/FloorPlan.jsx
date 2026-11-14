import {useEffect,useLayoutEffect,useRef,useState} from "react";

const CATEGORY_COLORS={
 moda:["#e8def8","#6a3fc8"],tenis:["#dce4fb","#2e4fd0"],eletronicos:["#dfe6ef","#36506e"],
 "cafe-doces":["#ecdfd2","#6b4428"],casa:["#f6e0cf","#b45a1c"],beleza:["#f8dce7","#b3346a"],
 games:["#d8efe3","#1e7a4c"],livros:["#f3ead0","#86690f"],esporte:["#d4eeec","#0f6b66"],
 alimentacao:["#fbe3d6","#b8461b"],servicos:["#e4e7ec","#4b5563"],lazer:["#fdeccb","#a1620a"],
};
const VACANT=["#ecebe6","#bdb8ad"];
const MARGIN=6;
const points=polygon=>polygon.map(([x,y])=>`${x},${y}`).join(" ");

/** viewBox na proporção do contêiner: sem distorção e com marcadores HTML alinhados. */
export function computeViewBox(floor,size,zoom,center){
 const fw=floor.width+MARGIN*2,fh=floor.height+MARGIN*2,aspect=size.w/size.h;
 let w=fw,h=fh;
 if(fw/fh>aspect)h=fw/aspect;else w=fh*aspect;
 w/=zoom;h/=zoom;
 return {x:center.x-w/2,y:center.y-h/2,w,h};
}

function runsOnFloor(nodes,from,to,nodeById,floorId){
 const runs=[];let run=[];
 for(let i=from;i<=to&&i<nodes.length;i++){
  const node=nodeById.get(nodes[i]);
  if(node.floorId===floorId)run.push(`${node.x},${node.y}`);
  else if(run.length){runs.push(run);run=[];}
 }
 if(run.length>1)runs.push(run);
 return runs.filter(r=>r.length>1).map(r=>r.join(" "));
}

/**
 * Planta do piso em SVG visto de cima, com sombra deslocada sob cada unidade no lugar do
 * 3D (research D5). Os marcadores e pontos são botões HTML posicionados sobre o SVG pela
 * função `project` passada a `children`. Arraste, roda, pinça e setas movem/aproximam.
 */
/**
 * Zoom e centro que mostram "bounds" (metros) inteiro na parte livre do contêiner, descontando
 * o que fica coberto por banner e painel (insets em px). Respeita os limites de zoom.
 */
export function fitView(floor,size,bounds,insets,{padding=1.3,minSize=30,zoomMin=1,zoomMax=12}={}){
 const [x0,y0,x1,y1]=bounds,bw=Math.max(x1-x0,minSize),bh=Math.max(y1-y0,minSize);
 const free={w:Math.max(80,size.w-insets.left-insets.right),h:Math.max(80,size.h-insets.top-insets.bottom)};
 const base=computeViewBox(floor,size,1,{x:0,y:0}).w;
 const wanted=Math.max(bw/free.w,bh/free.h)*padding;
 const zoom=Math.min(zoomMax,Math.max(zoomMin,base/(wanted*size.w)));
 const metersPerPx=base/(zoom*size.w);
 const dx=(insets.left-insets.right)/2,dy=(insets.top-insets.bottom)/2;
 return {zoom,center:{x:(x0+x1)/2-dx*metersPerPx,y:(y0+y1)/2-dy*metersPerPx}};
}

export function FloorPlan({index,floor,zoom,center,onPan,onZoom,onView,fit,getInsets,selectedUnitId,route,label,children}){
 const ref=useRef(null),pointers=useRef(new Map()),pinch=useRef(0);
 const [size,setSize]=useState({w:360,h:480});
 useLayoutEffect(()=>{
  const el=ref.current;if(!el)return;
  const observer=new ResizeObserver(([entry])=>{const r=entry.contentRect;setSize({w:Math.max(1,r.width),h:Math.max(1,r.height)});});
  observer.observe(el);return()=>observer.disconnect();
 },[]);
 // Enquadramento pedido (rota, passo ou loja): aplicado quando o tamanho real já é conhecido.
 useEffect(()=>{
  if(!fit||!onView||fit.floorId!==floor.id)return;
  const insets={top:0,bottom:0,left:0,right:0,...getInsets?.(ref.current)};
  onView(fitView(floor,size,fit.bounds,insets,{minSize:fit.minSize,zoomMin:fit.zoomMin??0.6}));
 },[fit?.key,floor.id,size.w,size.h]);
 const vb=computeViewBox(floor,size,zoom,center);
 const metersPerPx=vb.w/size.w;

 useEffect(()=>{
  const el=ref.current;if(!el)return;
  const wheel=event=>{event.preventDefault();onZoom(event.deltaY<0?1.2:1/1.2);};
  el.addEventListener("wheel",wheel,{passive:false});
  return()=>el.removeEventListener("wheel",wheel);
 },[onZoom]);

 function pointerDown(event){
  if(event.target.closest("button"))return;
  event.currentTarget.setPointerCapture(event.pointerId);
  pointers.current.set(event.pointerId,{x:event.clientX,y:event.clientY});
 }
 function pointerMove(event){
  const previous=pointers.current.get(event.pointerId);if(!previous)return;
  const current={x:event.clientX,y:event.clientY};
  pointers.current.set(event.pointerId,current);
  if(pointers.current.size===2){
   const [a,b]=[...pointers.current.values()],distance=Math.hypot(a.x-b.x,a.y-b.y);
   if(pinch.current)onZoom(distance/pinch.current);
   pinch.current=distance;return;
  }
  onPan(-(current.x-previous.x)*metersPerPx,-(current.y-previous.y)*metersPerPx);
 }
 function pointerUp(event){pointers.current.delete(event.pointerId);if(pointers.current.size<2)pinch.current=0;}
 function keyDown(event){
  const step=8/zoom;
  const moves={ArrowLeft:[-step,0],ArrowRight:[step,0],ArrowUp:[0,-step],ArrowDown:[0,step]};
  if(moves[event.key]){event.preventDefault();onPan(...moves[event.key]);}
  else if(event.key==="+"||event.key==="="){event.preventDefault();onZoom(1.25);}
  else if(event.key==="-"){event.preventDefault();onZoom(0.8);}
 }

 const project=([x,y])=>({left:`${(x-vb.x)/vb.w*100}%`,top:`${(y-vb.y)/vb.h*100}%`});
 const unitColor=unit=>{const store=index.storeByUnit.get(unit.id);return store?CATEGORY_COLORS[store.category.id]??CATEGORY_COLORS.casa:VACANT;};

 let walked=[],ahead=[],maneuver=null;
 if(route){
  const last=route.nodes.length-1;
  if(route.arrived)walked=runsOnFloor(route.nodes,0,last,index.nodeById,floor.id);
  else{
   const step=route.instructions[route.stepIndex];
   walked=runsOnFloor(route.nodes,0,step.fromIndex,index.nodeById,floor.id);
   ahead=runsOnFloor(route.nodes,step.fromIndex,last,index.nodeById,floor.id);
   const target=index.nodeById.get(route.nodes[step.toIndex]);
   if(target?.floorId===floor.id)maneuver=target;
  }
 }

 return <div ref={ref} className="floor-plan" tabIndex={0} role="group" aria-roledescription="mapa"
  aria-label={`${label}. Use as setas para mover o mapa e as teclas + e − para aproximar ou afastar.`}
  onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} onKeyDown={keyDown}>
  <svg viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`} preserveAspectRatio="none" aria-hidden="true">
   <polygon points={points(floor.outline)} transform="translate(1.6 2.2)" fill="#d3cec3"/>
   <polygon points={points(floor.outline)} fill="#ebe7df" stroke="#d9d4c9" strokeWidth="1" vectorEffect="non-scaling-stroke"/>
   {floor.corridors.map((c,i)=><polygon key={i} points={points(c)} fill="#faf8f3"/>)}
   {floor.units.map(unit=>{const [fill,stroke]=unitColor(unit),selected=unit.id===selectedUnitId;return <g key={unit.id}>
    <polygon points={points(unit.polygon)} transform="translate(0.9 1.3)" fill="#00000014"/>
    <polygon points={points(unit.polygon)} fill={fill} stroke={stroke} strokeWidth={selected?5:2.5} strokeDasharray={index.storeByUnit.has(unit.id)?undefined:"6 5"} vectorEffect="non-scaling-stroke" strokeLinejoin="round"/>
   </g>;})}
   {walked.map((p,i)=><polyline key={"w"+i} points={p} className="route-walked" vectorEffect="non-scaling-stroke"/>)}
   {ahead.map((p,i)=><polyline key={"a"+i} points={p} className="route-ahead" vectorEffect="non-scaling-stroke"/>)}
   {maneuver&&<circle cx={maneuver.x} cy={maneuver.y} r={2.2} className="route-maneuver" vectorEffect="non-scaling-stroke"/>}
  </svg>
  <div className="floor-plan-layer">{children(project,vb,size)}</div>
 </div>;
}
