import {HomeSectionState} from "./HomeSectionState.jsx";
// Somente categorias com produto e oferta visível chegam da API; nenhuma é inventada aqui.
export function CategoryRail({section,onSelect,onRetry}){
 return <section className="home-section" aria-labelledby="home-categories-title">
  <div className="home-section-heading"><h2 id="home-categories-title">Categorias</h2></div>
  <HomeSectionState section={section} label="categorias" emptyMessage="Ainda não há categorias com ofertas disponíveis. A busca continua disponível." onRetry={onRetry} placeholders={5} shape="pill"/>
  {section.status==="ready"&&<ul className="category-rail home-rail" aria-label="Categorias disponíveis">
   {section.items.map(c=><li key={c.id}><button type="button" className="category-chip" onClick={()=>onSelect(c)}>
    <span>{c.label}</span>{c.isDemo&&<span className="visually-hidden">, demonstração</span>}
   </button></li>)}
  </ul>}
  {section.status==="ready"&&section.items.some(c=>c.isDemo)&&<p className="home-section-note">Categorias do catálogo de demonstração.</p>}
 </section>;
}
