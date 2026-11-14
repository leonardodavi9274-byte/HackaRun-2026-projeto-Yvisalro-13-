import {useMemo, useState} from "react";
import {AppLink} from "../../../app/Link.jsx";
import {navigate} from "../../../app/navigation.js";
import {Icon} from "../../../shared/components/Icon.jsx";
import {productById} from "../data/catalog.js";
import {bestOffer, formatPrice, wishSummary} from "../models/catalog-model.js";
import {useDemoStore} from "../viewmodels/DemoStore.jsx";
import {DemoPage} from "./DemoChrome.jsx";
import {ProductTile} from "./ProductGlyph.jsx";

const SORTS = {recent: "Mais recentes", drop: "Maior queda de preço", price: "Menor preço"};

/** Tela 08 — Desejos e Avise-me. */
export function WishesView() {
  const store = useDemoStore(), account = store.account;
  const [tab, setTab] = useState("wishes"), [sort, setSort] = useState("recent"), [sortOpen, setSortOpen] = useState(false);
  const wishes = useMemo(() => {
    const list = account.wishes.map(wishSummary).filter(Boolean);
    if (sort === "drop") list.sort((a, b) => b.dropCents - a.dropCents);
    if (sort === "price") list.sort((a, b) => a.offer.priceCents - b.offer.priceCents);
    return list;
  }, [account.wishes, sort]);
  const drops = wishes.filter(w => w.dropCents > 0).length;
  const alerts = account.alerts.map(a => ({...a, product: productById(a.productId)})).filter(a => a.product);

  return <DemoPage current="/desejos" className="demo-wishes">
    <header className="demo-page-head"><h1>Seus desejos</h1>
      <button type="button" className="demo-square-button" aria-label="Ordenar" aria-expanded={sortOpen} onClick={() => setSortOpen(o => !o)}><Icon name="filter" size={22} /></button></header>
    {sortOpen && <div className="demo-filters is-open" role="radiogroup" aria-label="Ordenar desejos">
      {Object.entries(SORTS).map(([id, label]) => <button key={id} type="button" role="radio" aria-checked={sort === id} className="demo-chip" aria-pressed={sort === id} onClick={() => setSort(id)}>{label}</button>)}</div>}
    <div className="demo-tabs" role="tablist" aria-label="Listas">
      <button type="button" role="tab" aria-selected={tab === "wishes"} onClick={() => setTab("wishes")}>Desejos ({wishes.length})</button>
      <button type="button" role="tab" aria-selected={tab === "alerts"} onClick={() => setTab("alerts")}>Avise-me ({alerts.length})</button>
    </div>

    {tab === "wishes" && <div role="tabpanel">
      {drops > 0 && <p className="demo-drop-banner"><Icon name="trend-down" size={20} /><span><strong>{drops} {drops === 1 ? "item baixou" : "itens baixaram"} de preço</strong> desde que você salvou.</span></p>}
      {!wishes.length && <div className="demo-empty"><p>Sua lista está vazia.</p><p className="muted">Toque no coração de um produto para acompanhar o preço dele aqui.</p><AppLink className="demo-link" to="/buscar">Buscar produtos</AppLink></div>}
      <ul className="demo-wish-list">{wishes.map(w => <li key={w.product.id} className="demo-wish">
        <button type="button" className="demo-wish-open" onClick={() => navigate("/buscar?q=" + encodeURIComponent(w.product.name))} aria-label={`Ver ofertas de ${w.product.name}`}>
          <ProductTile product={w.product} size={88} />
          <span className="demo-wish-info"><strong>{w.product.name}</strong>
            <span className="demo-price">{formatPrice(w.offer.priceCents)}{w.dropCents > 0 ? <em className="demo-drop">↓ {formatPrice(w.dropCents)}</em> : <em className="demo-same">sem mudança</em>}</span>
            <span className="demo-wish-store">{w.available ? <>Mais barato em <strong>{w.store.name}</strong> · {w.storeCount} {w.storeCount === 1 ? "loja" : "lojas"}</> : "Sem estoque no momento"}</span></span>
        </button>
        <button type="button" className="demo-heart is-on" aria-pressed="true" aria-label={`Remover ${w.product.name} dos desejos`} onClick={() => store.toggleWish(w.product.id)}><Icon name="heart" size={22} fill="currentColor" /></button>
      </li>)}</ul>
    </div>}

    {tab === "alerts" && <div role="tabpanel">
      <p className="muted demo-pad">Avisaremos por e-mail{account.marketing ? "" : " (quando você ativar as ofertas por e-mail no Perfil)"}. Na demonstração, nenhum e-mail é enviado.</p>
      {!alerts.length && <div className="demo-empty"><p>Nenhum aviso ativo.</p><p className="muted">Use “Avise-me quando voltar” nos produtos sem estoque.</p></div>}
      <ul className="demo-wish-list">{alerts.map(a => { const offer = bestOffer(a.product); return <li key={a.productId} className="demo-wish">
        <span className="demo-wish-open"><ProductTile product={a.product} size={88} muted={offer.stock <= 0} />
          <span className="demo-wish-info"><strong>{a.product.name}</strong>
            <span className="demo-wish-store">{a.kind === "restock" ? (offer.stock > 0 ? "Voltou ao estoque!" : "Avisar quando voltar ao estoque") : `Avisar quando chegar a ${formatPrice(a.targetCents)} · hoje ${formatPrice(offer.priceCents)}`}</span></span></span>
        <button type="button" className="text-button" onClick={() => store.removeAlert(a.productId)}>Remover</button>
      </li>; })}</ul>
    </div>}
  </DemoPage>;
}
