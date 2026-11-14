import {useEffect,useId,useRef} from "react";
/** Confirmação de substituição da rota ativa: foco preso no diálogo; Esc = Manter rota. */
export function ReplaceRouteDialog({storeName,startLabel,onReplace,onKeep}){
 const titleId=useId(),keep=useRef(null),replace=useRef(null);
 useEffect(()=>{const previous=document.activeElement;keep.current?.focus();return()=>previous?.focus?.();},[]);
 function keyDown(event){
  if(event.key==="Escape"){event.preventDefault();onKeep();return;}
  if(event.key!=="Tab")return;
  event.preventDefault();
  (document.activeElement===keep.current?replace:keep).current?.focus();
 }
 return <div className="mall-dialog-backdrop">
  <div className="mall-dialog" role="alertdialog" aria-modal="true" aria-labelledby={titleId} onKeyDown={keyDown}>
   <h2 id={titleId}>Substituir a rota atual até {storeName}?</h2>
   {startLabel&&<p className="mall-meta">Ponto de partida: {startLabel}</p>}
   <div className="route-actions">
    <button type="button" ref={keep} className="secondary-button" onClick={onKeep}>Manter rota</button>
    <button type="button" ref={replace} className="primary-button mall-primary" onClick={onReplace}>Substituir</button>
   </div>
  </div>
 </div>;
}
