import {useEffect,useId,useRef} from "react";
import {CONNECTOR_NAME,etaMinutes,formatMeters} from "../models/instructions.js";
import {FormFeedback} from "../../../shared/components/FormFeedback.jsx";
/** Painel da rota ativa: tempo e distância restantes, chegada, passos e encerramento. Sem "Reservar item". */
export function RouteSheet({route,startPoint,floorNameOf,error,onPrevious,onNext,onEnd,onBackToMap,onChangeStart}){
 const titleId=useId(),endRef=useRef(null);
 const total=route.instructions.length,step=route.stepIndex;
 const remaining=route.arrived?0:route.instructions[step].remainingM;
 useEffect(()=>{if(route.arrived)endRef.current?.focus();},[route.arrived]);
 const via=route.arrivalConnector?` via ${CONNECTOR_NAME[route.arrivalConnector]}`:"";
 return <section className="mall-sheet route-sheet" aria-labelledby={titleId}>
  <h2 id={titleId} className="mall-sr-only">Rota ativa até {route.storeName}</h2>
  {route.arrived?<p className="route-eta">Chegada</p>:<p className="route-eta"><strong>{etaMinutes(remaining)} min</strong> · {formatMeters(remaining)}</p>}
  <p className="mall-meta">Chegada na {route.storeName} · {floorNameOf(route.arrivalFloorId)}{via}</p>
  {startPoint&&<p className="mall-meta">Partida: {startPoint.label} · <button type="button" className="text-button" onClick={onChangeStart}>Alterar ponto de partida</button></p>}
  <p className="mall-demo-note">Trajeto simulado em mapa de demonstração.</p>
  <FormFeedback message={error}/>
  <p className="route-step" aria-live="polite">{route.arrived?"Rota concluída":`Passo ${step+1} de ${total}`}</p>
  <div className="route-actions">
   <button type="button" className="secondary-button" disabled={!route.arrived&&step===0} onClick={onPrevious}>Anterior</button>
   {!route.arrived&&<button type="button" className="secondary-button" onClick={onNext}>Próxima</button>}
   {route.arrived&&<button type="button" className="secondary-button" onClick={onBackToMap}>Voltar ao mapa</button>}
  </div>
  <button type="button" ref={endRef} className="secondary-button mall-full route-end" onClick={onEnd}>Encerrar rota</button>
 </section>;
}
