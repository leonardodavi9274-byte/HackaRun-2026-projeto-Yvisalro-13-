import {AppLink} from "../../../app/Link.jsx";
import {useCatalogSearchViewModel} from "../viewmodels/useCatalogSearchViewModel.js";
import {OfferCard} from "./OfferCard.jsx";

export function CatalogSearchView(){
 const vm=useCatalogSearchViewModel(),d=vm.draft;
 const types=d.categoryId?vm.categories.find(c=>c.id===d.categoryId)?.types??[]:vm.categories.flatMap(c=>c.types);
 return <main className="catalog-page">
  <AppLink to="/">Início</AppLink><h1>Buscar produtos</h1>
  <p>Consulte produtos e ofertas de demonstração. Compras acontecem fora do aplicativo.</p>
  <form className="catalog-filters" onSubmit={e=>{e.preventDefault();vm.submit();}}>
   <label>Produto ou categoria<input value={d.q} onChange={e=>vm.change("q",e.target.value)} placeholder="Ex.: tênis"/></label>
   <label>Categoria<select value={d.categoryId} onChange={e=>vm.change("categoryId",e.target.value)}>
    <option value="">Todas</option>{vm.categories.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}</select></label>
   <label>Tipo<select value={d.typeId} onChange={e=>vm.change("typeId",e.target.value)}>
    <option value="">Todos</option>{types.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
   <label>Preço mínimo (R$)<input inputMode="decimal" value={d.minPrice} onChange={e=>vm.change("minPrice",e.target.value)} placeholder="0,00"/></label>
   <label>Preço máximo (R$)<input inputMode="decimal" value={d.maxPrice} onChange={e=>vm.change("maxPrice",e.target.value)} placeholder="0,00"/></label>
   <div className="catalog-actions"><button type="submit">Buscar</button><button type="button" onClick={vm.clear}>Limpar filtros</button></div>
  </form>
  {vm.formError&&<p role="alert">{vm.formError}</p>}
  {(vm.applied.q||vm.applied.categoryId||vm.applied.typeId||vm.applied.minPriceCents!==null&&vm.applied.minPriceCents!==undefined||vm.applied.maxPriceCents!==null&&vm.applied.maxPriceCents!==undefined)&&
   <p>Filtros aplicados: {[
    vm.applied.q&&`busca “${vm.applied.q}”`,
    vm.applied.categoryId&&`categoria ${vm.categories.find(c=>c.id===vm.applied.categoryId)?.label??vm.applied.categoryId}`,
    vm.applied.typeId&&`tipo ${vm.categories.flatMap(c=>c.types).find(t=>t.id===vm.applied.typeId)?.name??vm.applied.typeId}`,
    vm.applied.minPriceCents!=null&&`mínimo ${(vm.applied.minPriceCents/100).toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}`,
    vm.applied.maxPriceCents!=null&&`máximo ${(vm.applied.maxPriceCents/100).toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}`
   ].filter(Boolean).join(" · ")}</p>}
  {vm.categoryError&&<div role="alert">Categorias indisponíveis: {vm.categoryError} <button onClick={vm.retry}>Tentar novamente</button></div>}
  {vm.state.loading&&<p role="status">Buscando produtos…</p>}
  {vm.state.error&&<div role="alert"><p>{vm.state.error}</p><button onClick={vm.retry}>Tentar novamente</button></div>}
  {!vm.state.loading&&!vm.state.error&&<>
   <h2>Resultados</h2>
   {!vm.state.offers.length&&<p>Nenhum produto encontrado. Altere a busca ou os filtros.</p>}
   {vm.state.suggestion&&<p>Você quis dizer <button type="button" className="catalog-suggestion" onClick={vm.chooseSuggestion}>{vm.state.suggestion}</button>?</p>}
   <div className="catalog-grid">{vm.state.offers.map(o=><OfferCard key={o.id} offer={o}/>)}</div>
  </>}
 </main>;
}
