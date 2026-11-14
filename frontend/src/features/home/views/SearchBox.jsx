import {useState} from "react";
import {Icon} from "../../../shared/components/Icon.jsx";
// Encaminha o termo exatamente como digitado (FR-002); só bloqueia o envio vazio.
export function SearchBox({onSearch,initialQuery=""}){
 const [query,setQuery]=useState(initialQuery),[hint,setHint]=useState("");
 return <form className="home-search" role="search" onSubmit={e=>{e.preventDefault();if(!query.trim()){setHint("Digite um produto, loja ou categoria para pesquisar.");return;}setHint("");onSearch(query);}}>
  <label htmlFor="home-search-input">Buscar produtos, lojas ou categorias</label>
  <div className="home-search-field">
   <Icon name="search" size={20} aria-hidden="true"/>
   <input id="home-search-input" type="search" value={query} maxLength={200} autoComplete="off" enterKeyHint="search" aria-describedby={hint?"home-search-hint":undefined} onChange={e=>{setQuery(e.target.value);if(hint)setHint("");}} placeholder="Ex.: fone sem fio"/>
   <button type="submit">Pesquisar</button>
  </div>
  <p id="home-search-hint" className="home-search-hint" aria-live="polite">{hint}</p>
 </form>;
}
