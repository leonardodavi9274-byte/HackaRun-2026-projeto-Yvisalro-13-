import {FormFeedback} from "../../../shared/components/FormFeedback.jsx";
const icons={
 moda:<path d="m8 3-5 3 3 5 2-1v11h8V10l2 1 3-5-5-3c-1 4-7 4-8 0Z"/>,
 tenis:<path d="M3 13c3 0 4-4 4-6l4 3 2 3 7 2 1 5H3v-7Zm0 4h18M9 11l2 2m1-1 2 2"/>,
 eletronicos:<><path d="M4 13v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="12" width="4" height="8" rx="1"/><rect x="17" y="12" width="4" height="8" rx="1"/></>,
 beleza:<><path d="M9 3h6v5H9zM8 8h8v14H8z"/><path d="M11 12h2"/></>,
 casa:<><path d="m3 11 9-8 9 8M5 10v11h14V10M10 21v-7h4v7"/></>,
 "cafe-doces":<><path d="M4 9h13v7a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9ZM17 10h2a3 3 0 1 1 0 6h-2M7 3v3m5-3v3"/></>,
 games:<><path d="M7 8h10c4 0 6 11 2 12l-4-4H9l-4 4C1 19 3 8 7 8Z"/><path d="M8 10v5m-2-3h4m6-1h1m1 3h1"/></>,
 livros:<><path d="M12 5v16M12 5C8 2 4 3 3 4v16c3-2 6-1 9 1 3-2 6-3 9-1V4c-4-2-6-1-9 1Z"/></>,
 esporte:<><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18M5 7h14M5 17h14"/></>
};
export function CategoryGrid({categories=[],selected=[],onChange,loading,error,onRetry,disabled=false}){
 function toggle(id){onChange(selected.includes(id)?selected.filter(v=>v!==id):[...selected,id]);}
 return <section aria-label="Categorias de interesse">{loading&&<p className="muted" role="status">Carregando categorias…</p>}<FormFeedback message={error?.message}>{onRetry&&<button className="text-button" type="button" onClick={onRetry}>Tentar carregar novamente</button>}</FormFeedback>{!loading&&!error&&!categories.length&&<p className="muted">Nenhuma categoria disponível. Você ainda pode informar produtos de interesse ou pular.</p>}<div className="category-grid">{categories.map(c=><button key={c.id} type="button" className="category-option" aria-pressed={selected.includes(c.id)} disabled={disabled} onClick={()=>toggle(c.id)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true">{icons[c.id]||icons.esporte}</svg><span>{c.label}</span><span className="visually-hidden">{selected.includes(c.id)?"Selecionada":"Não selecionada"}</span></button>)}</div></section>;
}
