import {useId,useState} from "react";
import {Icon} from "../../../shared/components/Icon.jsx";
/** Busca por nome e categoria (combobox + listbox, setas para navegar, Enter seleciona). */
export function MapSearch({query,onQuery,suggestions,floorNameOf,onSelect}){
 const id=useId(),listId=id+"-list";
 const [open,setOpen]=useState(false),[active,setActive]=useState(-1);
 const hasQuery=query.trim().length>0,expanded=open&&hasQuery;
 function choose(store){onSelect(store.id);onQuery("");setOpen(false);setActive(-1);}
 function keyDown(event){
  if(event.key==="ArrowDown"&&suggestions.length){event.preventDefault();setOpen(true);setActive(i=>(i+1)%suggestions.length);}
  else if(event.key==="ArrowUp"&&suggestions.length){event.preventDefault();setOpen(true);setActive(i=>(i<=0?suggestions.length:i)-1);}
  else if(event.key==="Enter"&&expanded){const store=suggestions[Math.max(0,active)];if(store){event.preventDefault();choose(store);}}
  else if(event.key==="Escape"){setOpen(false);setActive(-1);}
 }
 return <div className="map-search">
  <label htmlFor={id} className="mall-sr-only">Buscar loja no mapa</label>
  <Icon name="search" size={20}/>
  <input id={id} type="search" role="combobox" autoComplete="off" placeholder="Buscar loja no mapa" value={query}
   aria-expanded={expanded} aria-controls={listId} aria-autocomplete="list"
   aria-activedescendant={expanded&&active>=0?`${listId}-${active}`:undefined}
   onChange={e=>{onQuery(e.target.value);setOpen(true);setActive(-1);}} onFocus={()=>setOpen(true)} onKeyDown={keyDown}
   onBlur={()=>setTimeout(()=>setOpen(false),150)}/>
  {expanded&&<div className="map-search-results">
   {suggestions.length?<ul id={listId} role="listbox" aria-label="Lojas encontradas">
    {suggestions.map((store,i)=><li key={store.id} id={`${listId}-${i}`} role="option" aria-selected={i===active}
     className={i===active?"is-active":""} onMouseDown={e=>e.preventDefault()} onClick={()=>choose(store)}>
     <strong>{store.name}</strong><span>{store.positioned?floorNameOf(store.floorId):"Localização no mapa indisponível"} · {store.category.label}</span>
    </li>)}
   </ul>:<div id={listId} className="map-search-empty" role="status"><p>Nenhuma loja encontrada</p>
    <button type="button" className="text-button" onMouseDown={e=>e.preventDefault()} onClick={()=>{onQuery("");setActive(-1);}}>Limpar busca</button></div>}
  </div>}
 </div>;
}
