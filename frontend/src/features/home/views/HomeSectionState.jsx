// Estado de uma seção: carregamento, vazio ou indisponível. "ready" não renderiza nada.
export function HomeSectionState({section,label,emptyMessage,onRetry,placeholders=3,shape="card"}){
 if(section.status==="ready")return null;
 if(section.status==="loading")return <div className="home-state">
  <p className="visually-hidden" role="status">Carregando {label}…</p>
  <div className={"home-skeleton home-skeleton-"+shape} aria-hidden="true">{Array.from({length:placeholders},(_,i)=><span key={i}/>)}</div>
 </div>;
 if(section.status==="empty")return <p className="home-state home-empty">{emptyMessage||"Ainda não há "+label+" disponíveis no momento."}</p>;
 return <div className="home-state home-error" role="alert">
  <p>Não foi possível carregar {label}. As outras seções continuam disponíveis.</p>
  <button type="button" className="home-link-button" onClick={onRetry}>Tentar novamente</button>
 </div>;
}
export const DemoBadge=({show,className=""})=>show?<span className={"demo-badge "+className}>Demonstração</span>:null;
