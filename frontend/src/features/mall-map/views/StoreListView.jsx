import {useEffect,useId,useRef} from "react";
import {Icon} from "../../../shared/components/Icon.jsx";
import {categoriesOf,filterByCategory} from "../models/store-search.js";
/** Alternativa textual completa ao mapa: lojas por piso, filtro por categoria e as mesmas ações. */
export function StoreListView({index,categoryId,onCategory,onShow,onRoute,onClose}){
 const titleId=useId(),title=useRef(null);
 useEffect(()=>{title.current?.focus();},[]);
 const stores=filterByCategory(index.stores,categoryId);
 const groups=[...index.floors].map(floor=>({key:floor.id,title:floor.name,stores:stores.filter(s=>s.floorId===floor.id)}));
 const unplaced=stores.filter(s=>!s.positioned);
 if(unplaced.length)groups.push({key:"sem-posicao",title:"Localização no mapa indisponível",stores:unplaced});
 return <section className="mall-sheet store-list" aria-labelledby={titleId}>
  <div className="mall-sheet-head">
   <h2 id={titleId} ref={title} tabIndex={-1}>Lojas do {index.mall.name}</h2>
   <button type="button" className="icon-button" aria-label="Fechar lista de lojas" onClick={onClose}><Icon name="close" size={20}/></button>
  </div>
  <div className="chip-row" role="group" aria-label="Filtrar por categoria">
   <button type="button" className="chip" aria-pressed={!categoryId} onClick={()=>onCategory(null)}>Todas</button>
   {categoriesOf(index.stores).map(c=><button type="button" key={c.id} className="chip" aria-pressed={categoryId===c.id} onClick={()=>onCategory(c.id)}>{c.label}</button>)}
  </div>
  {!stores.length&&<p className="mall-note" role="status">Nenhuma loja encontrada nesta categoria.</p>}
  {groups.filter(g=>g.stores.length).map(group=><div key={group.key} className="store-list-group">
   <h3>{group.title}</h3>
   <ul>{group.stores.map(store=><li key={store.id}>
    <div><strong>{store.name}</strong><span>{store.category.label}</span></div>
    <div className="store-list-actions">
     {store.positioned&&<button type="button" className="text-button" onClick={()=>onShow(store.id)} aria-label={`Ver ${store.name} no mapa`}>Ver no mapa</button>}
     <button type="button" className="secondary-button" disabled={!store.positioned} onClick={()=>onRoute(store.id)}
      aria-label={store.positioned?`Traçar rota até ${store.name}`:`Traçar rota até ${store.name} indisponível: localização no mapa indisponível`}>Traçar rota</button>
    </div>
   </li>)}</ul>
  </div>)}
 </section>;
}
