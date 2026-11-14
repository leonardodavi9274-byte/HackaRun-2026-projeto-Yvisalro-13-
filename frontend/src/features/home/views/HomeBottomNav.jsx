import {AppLink} from "../../../app/Link.jsx";
import {Icon} from "../../../shared/components/Icon.jsx";
import {SEARCH_PATH} from "../../../app/navigation.js";
// Áreas principais do consumidor. Desejos e Mapa ainda não existem: ficam identificadas, sem destino falso.
const AREAS=[
 {id:"inicio",label:"Início",icon:"bag",to:"/inicio"},
 {id:"buscar",label:"Buscar",icon:"search",to:SEARCH_PATH},
 {id:"desejos",label:"Desejos",icon:"heart"},
 {id:"mapa",label:"Mapa",icon:"pin"},
];
export function HomeBottomNav({current}){
 return <nav className="home-bottom-nav" aria-label="Áreas principais">
  <ul>{AREAS.map(a=><li key={a.id}>{a.to
   ?<AppLink to={a.to} aria-current={current===a.id?"page":undefined}><Icon name={a.icon} size={20} aria-hidden="true"/><span>{a.label}</span></AppLink>
   :<span className="home-bottom-soon" aria-disabled="true"><Icon name={a.icon} size={20} aria-hidden="true"/><span>{a.label}<small> · em breve</small></span></span>}
  </li>)}</ul>
 </nav>;
}
