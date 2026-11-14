import {Icon} from "../../../shared/components/Icon.jsx";
/** Botão com sacola; aproximado, mostra o logo (FR-003). Compacto quando o mapa mostra área grande. */
export function StoreMarker({store,accessibleName,style,selected,showLogo,showName,compact,onSelect}){
 const logo=showLogo&&store.logoUrl;
 return <button type="button" className={"store-marker"+(selected?" is-selected":"")+(compact&&!selected?" is-compact":"")} style={style}
  aria-label={accessibleName+(selected?", selecionada":"")} onClick={()=>onSelect(store.id)}>
  <span className="store-marker-pin">{logo?<img src={store.logoUrl} alt={store.name} width="64" height="64"/>:<Icon name="bag" size={18}/>}</span>
  {(selected||showName)&&<span className="store-marker-label" aria-hidden="true">{store.name}{selected&&<em> · Selecionada</em>}</span>}
 </button>;
}
