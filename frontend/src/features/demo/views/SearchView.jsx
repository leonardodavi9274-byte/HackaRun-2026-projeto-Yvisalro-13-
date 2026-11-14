import {useEffect, useMemo, useRef, useState} from "react";
import {navigate, useSearchParam} from "../../../app/navigation.js";
import {Icon} from "../../../shared/components/Icon.jsx";
import {CATEGORIES} from "../data/catalog.js";
import {comparison, discountPercent, formatPrice, searchCatalog} from "../models/catalog-model.js";
import {useDemoStore} from "../viewmodels/DemoStore.jsx";
import {DemoPage} from "./DemoChrome.jsx";
import {ProductTile, StoreBadge} from "./ProductGlyph.jsx";

function StockLabel({stock}) {
  if (stock <= 0) return <span className="demo-stock is-out">Sem estoque</span>;
  if (stock <= 3) return <span className="demo-stock is-low">Últimas {stock} unidades</span>;
  return <span className="demo-stock">Em estoque</span>;
}

/** Tela 06 — Resultados da busca. */
export function SearchView() {
  const store = useDemoStore(), qParam = useSearchParam("q") ?? "", all = useSearchParam("todos") === "1";
  const [text, setText] = useState(qParam), [filters, setFilters] = useState({onlyPromo: false, onlyInStock: false, type: null});
  const [showFilters, setShowFilters] = useState(false);
  const inputRef = useRef(null);
  const term = all ? "" : qParam;

  useEffect(() => { setText(qParam); setFilters({onlyPromo: false, onlyInStock: false, type: null}); if (qParam) store.recordSearch(qParam); }, [qParam]);
  useEffect(() => { if (!qParam && !all) inputRef.current?.focus(); }, []);

  const {results, types, understood, query} = useMemo(() => searchCatalog(term, filters), [term, filters]);
  const compare = useMemo(() => comparison(results), [results]);
  const searching = Boolean(term) || all;

  const submit = event => { event.preventDefault(); navigate("/buscar?q=" + encodeURIComponent(text.trim())); };
  const toggle = key => setFilters(f => ({...f, [key]: !f[key]}));

  return <DemoPage current="/buscar" className="demo-search">
    <form className="demo-search-head" role="search" onSubmit={submit}>
      <button type="button" className="demo-icon-button" aria-label="Voltar" onClick={() => history.length > 1 ? history.back() : navigate("/inicio")}><Icon name="back" size={24} /></button>
      <div className="demo-search-box">
        <input ref={inputRef} value={text} onChange={e => setText(e.target.value)} aria-label="Buscar produto, loja ou categoria" placeholder="Ex.: fone bluetooth até 300" enterKeyHint="search" />
        <button type="button" className="demo-filter-button" aria-label="Filtros" aria-expanded={showFilters} onClick={() => setShowFilters(v => !v)}><Icon name="filter" size={22} /></button>
      </div>
    </form>

    {!searching && <section className="demo-section">
      {store.account.recentSearches.length > 0 && <>
        <div className="demo-section-head"><h2>Buscas recentes</h2><button type="button" className="text-button" onClick={store.clearSearches}>Limpar</button></div>
        <ul className="demo-chip-list">{store.account.recentSearches.map(t => <li key={t}><button type="button" className="demo-chip" onClick={() => navigate("/buscar?q=" + encodeURIComponent(t))}>{t}</button></li>)}</ul>
      </>}
      <div className="demo-section-head"><h2>Categorias</h2></div>
      <ul className="demo-chip-list">{CATEGORIES.map(c => <li key={c.id}><button type="button" className="demo-chip" onClick={() => navigate("/buscar?q=" + encodeURIComponent(c.label))}>{c.label}</button></li>)}</ul>
      <p className="muted">Dica: escreva o preço máximo, como “tênis até 250”.</p>
    </section>}

    {searching && <>
      {term && <p className="demo-understood">Entendemos: <strong>{understood.subject || term}</strong>{understood.maxCents !== null && <> · preço até <strong>{formatPrice(understood.maxCents)}</strong></>}</p>}
      <div className={"demo-filters" + (showFilters ? " is-open" : "")} role="group" aria-label="Filtros">
        <button type="button" className="demo-chip" aria-pressed={filters.onlyPromo} onClick={() => toggle("onlyPromo")}>Em promoção</button>
        <button type="button" className="demo-chip" aria-pressed={filters.onlyInStock} onClick={() => toggle("onlyInStock")}>Em estoque</button>
        {types.map(t => <button key={t} type="button" className="demo-chip" aria-pressed={filters.type === t} onClick={() => setFilters(f => ({...f, type: f.type === t ? null : t}))}>Tipo: {t}</button>)}
      </div>
      {compare && <p className="demo-compare"><Icon name="pulse" size={22} /><span><strong>{compare.product.name} em {compare.count} lojas.</strong> Na {compare.cheapest.name} sai {formatPrice(compare.diffCents)} mais barato que na {compare.priciest.name}.</span></p>}
      <h2 className="demo-sort-label" aria-live="polite">{results.length ? `${results.length} ${results.length === 1 ? "resultado" : "resultados"} · mais relevantes, depois menor preço` : "Nenhum resultado"}</h2>
      {results.length === 0 && <div className="demo-empty">
        <p>Não encontramos produtos cadastrados para “{query.raw}”{query.maxCents !== null ? ` até ${formatPrice(query.maxCents)}` : ""}.</p>
        <p className="muted">Tente outra palavra, aumente o preço máximo ou retire filtros. Tudo bem sair sem comprar.</p>
      </div>}
      <ul className="demo-results">
        {results.map(({product, offer, store: shop}) => {
          const out = offer.stock <= 0, alerted = store.hasAlert(product.id);
          return <li key={product.id + offer.storeId} className={"demo-result" + (out ? " is-out" : "")}>
            <ProductTile product={product} discount={out ? 0 : discountPercent(offer)} size={104} muted={out} />
            <div className="demo-result-info">
              <h3>{product.name}</h3>
              <p className="demo-price">{formatPrice(offer.priceCents)}{offer.previousCents && <s>{formatPrice(offer.previousCents)}</s>}</p>
              <p className="demo-result-store"><StoreBadge store={shop} /><strong>{shop.name}</strong><span>· {shop.distanceM} m · {shop.floor}</span></p>
              {out ? <button type="button" className="demo-alert-button" aria-pressed={alerted} onClick={() => alerted ? store.removeAlert(product.id) : store.addAlert(product.id, "restock")}>
                <Icon name="bell" size={18} />{alerted ? "Aviso ativado" : "Avise-me quando voltar"}</button> : <StockLabel stock={offer.stock} />}
            </div>
            {!out && <button type="button" className="demo-route-button" aria-label={`Rota até ${shop.name}`} onClick={() => navigate(`/mapa?loja=${shop.id}`)}><Icon name="navigate" size={22} /></button>}
          </li>;
        })}
      </ul>
      <p className="demo-foot-note">Distâncias simuladas a partir da entrada principal. Preços e estoques fictícios.</p>
    </>}
  </DemoPage>;
}
