import {AppLink} from "../../app/Link.jsx";
import {Icon} from "./Icon.jsx";
import {isDemoMode} from "../../features/demo/demo-mode.js";
/**
 * Navegação inferior só com destinos existentes (research D12). No fluxo real: Início e Mapa.
 * No modo demonstração as cinco abas do protótipo existem (Início, Buscar, Mapa, Desejos, Perfil).
 * "/inicio" leva a "/entrar" quando não há sessão (regra do App).
 */
const REAL=[{to:"/inicio",label:"Início",icon:"home"},{to:"/mapa",label:"Mapa",icon:"map"}];
const DEMO=[{to:"/inicio",label:"Início",icon:"home"},{to:"/buscar",label:"Buscar",icon:"search"},{to:"/mapa",label:"Mapa",icon:"map"},{to:"/desejos",label:"Desejos",icon:"heart"},{to:"/perfil",label:"Perfil",icon:"user"}];
export function BottomNav({current}){
 const items=isDemoMode()?DEMO:REAL;
 return <nav className={"bottom-nav"+(isDemoMode()?" bottom-nav-full":"")} aria-label="Navegação principal"><ul>
  {items.map(item=>{const active=item.to===current;return <li key={item.to}>
   <AppLink to={item.to} aria-current={active?"page":undefined} className={active?"is-current":undefined}>
    <Icon name={item.icon} size={22}/><span>{item.label}</span>
   </AppLink></li>;})}
 </ul></nav>;
}
