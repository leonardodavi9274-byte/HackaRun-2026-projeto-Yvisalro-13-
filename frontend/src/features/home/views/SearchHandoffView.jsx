import {AppLink} from "../../../app/Link.jsx";
import {navigate,readSearchIntent,searchPath,useSearch} from "../../../app/navigation.js";
import {SearchBox} from "./SearchBox.jsx";
import {HomeBottomNav} from "./HomeBottomNav.jsx";
// Ponto de entrega para os resultados da feature 005. Preserva q/categoria e não inventa resultados.
export function SearchHandoffView(){
 const search=useSearch(),{query,categoryId}=readSearchIntent(search);
 return <div className="home-page">
  <a className="skip-link" href="#search-content">Ir para o conteúdo</a>
  <main className="home-shell" id="search-content" tabIndex="-1">
   <AppLink to="/inicio" className="home-back-link">‹ Voltar ao início</AppLink>
   <h1>Resultados da busca</h1>
   <SearchBox key={search} initialQuery={query??""} onSearch={q=>navigate(searchPath({query:q,categoryId}))}/>
   {(query||categoryId)&&<dl className="dialog-facts">
    {query&&<div><dt>Termo pesquisado</dt><dd>{query}</dd></div>}
    {categoryId&&<div><dt>Categoria</dt><dd>{categoryId}</dd></div>}
   </dl>}
   <p className="home-state home-empty" role="status">Os resultados de busca ainda não estão disponíveis nesta versão. A pesquisa foi preservada para a próxima etapa.</p>
  </main>
  <HomeBottomNav current="buscar"/>
 </div>;
}
