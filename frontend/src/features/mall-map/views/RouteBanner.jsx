import {Icon} from "../../../shared/components/Icon.jsx";
/**
 * Faixa superior da rota (tela 10). Ícone e texto vêm do mesmo instruction.kind
 * (tabela DIRECTIONS em models/instructions.js), por isso sempre indicam a mesma direção.
 */
export function RouteBanner({route,instruction}){
 const arrived=route.arrived;
 const icon=arrived?"arrive":instruction.icon,text=arrived?`Você chegou à ${route.storeName}`:instruction.text;
 return <div className="route-banner-wrap">
  <div className="route-banner" aria-live="polite">
   <span className="route-banner-icon"><Icon name={icon} size={30}/></span>
   <div><p className="route-banner-text">{text}</p>
    {!arrived&&instruction.landmark&&<p className="route-banner-sub">Referência: {instruction.landmark}</p>}</div>
  </div>
  <p className="ads-paused"><Icon name="ads-off" size={16}/>Anúncios pausados durante a rota</p>
 </div>;
}
