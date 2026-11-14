import {useId} from "react";
import {initials} from "../models/map-document.js";
import {formatMeters} from "../models/instructions.js";
/**
 * "Perto de você": até 5 lojas pela distância de caminhada simulada a partir do ponto
 * escolhido. Sem ponto, nenhuma distância é exibida. Sem ofertas enquanto o catálogo não existir.
 */
export function NearbyPanel({startPoint,items,floorNameOf,onChooseStart,onSelect,onRoute}){
 const titleId=useId();
 return <section className="nearby" aria-labelledby={titleId}>
  <div className="nearby-head"><h2 id={titleId}>Perto de você</h2>
   {startPoint&&<button type="button" className="text-button" onClick={onChooseStart}>Alterar ponto</button>}</div>
  {!startPoint?<><p className="mall-meta">Escolha onde você está para ver as lojas próximas</p>
   <button type="button" className="secondary-button mall-full" onClick={onChooseStart}>Onde você está?</button></>
  :<><p className="mall-meta">A partir de {startPoint.label}</p>
   {items.length?<ul className="nearby-list">{items.map(({store,distanceM})=><li key={store.id}>
    <button type="button" className="nearby-card" onClick={()=>onSelect(store.id)} aria-label={`${store.name}, ${floorNameOf(store.floorId)}, ${formatMeters(distanceM)}`}>
     <span className="nearby-initials" aria-hidden="true">{initials(store.name)}</span>
     <span><strong>{store.name}</strong><span>{floorNameOf(store.floorId)} · {formatMeters(distanceM)}</span></span>
    </button>
    <button type="button" className="text-button" onClick={()=>onRoute(store.id)} aria-label={`Traçar rota até ${store.name}`}>Traçar rota</button>
   </li>)}</ul>:<p className="mall-note">Nenhuma loja com caminho conhecido a partir deste ponto.</p>}</>}
 </section>;
}
