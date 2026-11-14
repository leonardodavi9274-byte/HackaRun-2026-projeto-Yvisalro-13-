import {useEffect,useId,useRef} from "react";
import {Icon} from "../../../shared/components/Icon.jsx";
/** Detalhes da loja: diálogo não modal; o foco vai para o título ao abrir. */
export function StoreDetailsSheet({store,floorLabel,onRoute,onClose,routeDisabledReason}){
 const titleId=useId(),noteId=useId(),title=useRef(null);
 useEffect(()=>{title.current?.focus();},[store.id]);
 const unavailable=!store.positioned;
 return <section className="mall-sheet" role="dialog" aria-modal="false" aria-labelledby={titleId}>
  <div className="mall-sheet-head">
   <h2 id={titleId} ref={title} tabIndex={-1}>{store.name}</h2>
   <button type="button" className="icon-button" aria-label="Fechar detalhes da loja" onClick={onClose}><Icon name="close" size={20}/></button>
  </div>
  <p className="mall-meta">{store.category.label} · {unavailable?"Localização no mapa indisponível":floorLabel}</p>
  {store.isDemo&&<p className="mall-demo-note">Loja fictícia de demonstração.</p>}
  {(unavailable||routeDisabledReason)&&<p id={noteId} className="mall-note">{unavailable?"Localização no mapa indisponível: não é possível traçar rota até esta loja.":routeDisabledReason}</p>}
  <button type="button" className="primary-button mall-primary" disabled={unavailable} aria-describedby={unavailable?noteId:undefined} onClick={()=>onRoute(store.id)}>
   <Icon name="map" size={20}/>Traçar rota
  </button>
 </section>;
}
