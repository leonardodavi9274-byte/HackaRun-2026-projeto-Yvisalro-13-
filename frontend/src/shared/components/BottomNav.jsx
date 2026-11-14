import {AppLink} from "../../app/Link.jsx";
import {Icon} from "./Icon.jsx";
/**
 * Navegação inferior só com destinos existentes (research D12): Início e Mapa.
 * "/inicio" leva a "/entrar" quando não há sessão (regra do App).
 */
const ITEMS=[{to:"/inicio",label:"Início",icon:"home"},{to:"/mapa",label:"Mapa",icon:"map"}];
export function BottomNav({current}){
 return <nav className="bottom-nav" aria-label="Navegação principal"><ul>
  {ITEMS.map(item=>{const active=item.to===current;return <li key={item.to}>
   <AppLink to={item.to} aria-current={active?"page":undefined} className={active?"is-current":undefined}>
    <Icon name={item.icon} size={22}/><span>{item.label}</span>
   </AppLink></li>;})}
 </ul></nav>;
}
