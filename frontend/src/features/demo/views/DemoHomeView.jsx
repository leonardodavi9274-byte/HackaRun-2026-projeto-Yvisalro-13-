import {useEffect, useMemo, useState} from "react";
import {AppLink} from "../../../app/Link.jsx";
import {navigate} from "../../../app/navigation.js";
import {Icon} from "../../../shared/components/Icon.jsx";
import {CATEGORIES, DEMO_MALL, STORES} from "../data/catalog.js";
import {categoryDiscount, discountPercent, formatPrice, recommendations, storiesByStore, wishSummary} from "../models/catalog-model.js";
import {useDemoStore} from "../viewmodels/DemoStore.jsx";
import {DemoNotice, DemoPage, WishButton} from "./DemoChrome.jsx";
import {NearbyOfferSheet} from "./NearbyOfferSheet.jsx";
import {Initials, ProductGlyph, ProductTile} from "./ProductGlyph.jsx";

const CATEGORY_GLYPH = {eletronicos: "headphones", tenis: "shoe", "cafe-doces": "cup", beleza: "bottle", moda: "shirt", casa: "pot", games: "gamepad", livros: "book", esporte: "ball"};
const CATEGORY_SHORT = {eletronicos: "Fones", tenis: "Tênis", "cafe-doces": "Café", beleza: "Skincare", moda: "Moda", casa: "Casa", games: "Games", livros: "Livros", esporte: "Esporte"};
const CATEGORY_QUERY = {eletronicos: "fone", tenis: "tênis", "cafe-doces": "café", beleza: "skincare", moda: "moda", casa: "casa", games: "games", livros: "livro", esporte: "esporte"};

/** Contagem regressiva até o fim do dia (validade fictícia do destaque). */
function useCountdown() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const end = new Date(now); end.setHours(23, 59, 59, 999);
  const s = Math.max(0, Math.floor((end - now) / 1000));
  return [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map(v => String(v).padStart(2, "0")).join(":");
}

/** Tela 05 — Início. */
export function DemoHomeView() {
  const store = useDemoStore(), account = store.account;
  const countdown = useCountdown();
  const stories = useMemo(storiesByStore, []);

  const forYou = useMemo(() => {
    const chosen = account.categoryIds.length ? account.categoryIds : ["eletronicos", "tenis", "cafe-doces", "beleza"];
    return [...chosen, ...CATEGORIES.map(c => c.id)].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4);
  }, [account.categoryIds]);

  const highlight = useMemo(() => {
    const fromList = account.wishes.map(wishSummary).filter(w => w?.available && w.offer.previousCents)
      .sort((a, b) => discountPercent(b.offer) - discountPercent(a.offer))[0];
    if (fromList) return {...fromList, fromList: true};
    const rec = recommendations({categoryIds: account.categoryIds}).find(r => r.offer.previousCents);
    return rec ? {product: rec.product, offer: rec.offer, store: STORES.find(s => s.id === rec.offer.storeId), fromList: false} : null;
  }, [account.wishes, account.categoryIds]);

  const recs = useMemo(() => recommendations({categoryIds: account.categoryIds, exclude: highlight ? [highlight.product.id] : []}), [account.categoryIds, highlight]);
  const drops = account.wishes.map(wishSummary).filter(w => w?.dropCents > 0).length;

  return <DemoPage current="/inicio" className="demo-home">
    <header className="demo-home-head">
      <AppLink to="/perfil" aria-label="Abrir perfil"><Initials name={account.name} size={58} photo={account.photo} /></AppLink>
      <div className="demo-home-greeting"><span>{DEMO_MALL.name} · Térreo</span><h1>Olá, {account.name.split(" ")[0]}</h1></div>
      <button type="button" className="demo-bell" aria-label={drops ? `${drops} itens dos seus desejos baixaram de preço` : "Notificações"} onClick={() => navigate("/desejos")}>
        <Icon name="bell" size={22} />{drops > 0 && <span className="demo-dot" />}
      </button>
    </header>

    <form className="demo-search-dark" role="search" onSubmit={e => { e.preventDefault(); navigate("/buscar?q=" + encodeURIComponent(new FormData(e.currentTarget).get("q") ?? "")); }}>
      <Icon name="search" size={22} /><input name="q" aria-label="Buscar produto, loja ou categoria" placeholder="Buscar produto, loja ou categoria" />
    </form>

    <section aria-label="Stories das lojas" className="demo-stories">
      {STORES.slice(0, 8).map(s => {
        const has = stories.has(s.id);
        return <button type="button" key={s.id} className={"demo-story" + (has ? " has-story" : "")} disabled={!has}
          onClick={() => navigate(`/stories?loja=${s.id}`)} aria-label={has ? `Ver stories da ${s.name}` : `${s.name} sem stories agora`}>
          <span className="demo-story-ring"><span style={{background: s.color}}>{s.initials}</span></span><span className="demo-story-name">{s.name}</span>
        </button>;
      })}
    </section>

    <section className="demo-section">
      <div className="demo-section-head"><h2>Pra você</h2><span>{account.recentSearches.length ? "Pelas suas últimas buscas" : "Pelos seus interesses"}</span></div>
      <div className="demo-for-you">
        {forYou.map(id => { const d = categoryDiscount(id); return <AppLink key={id} to={"/buscar?q=" + encodeURIComponent(CATEGORY_QUERY[id])} className="demo-for-you-card">
          {d > 0 && <span className="demo-badge">-{d}%</span>}<ProductGlyph glyph={CATEGORY_GLYPH[id]} color="#17181d" size={30} /><span>{CATEGORY_SHORT[id]}</span>
        </AppLink>; })}
      </div>
    </section>

    {highlight && <section className="demo-highlight" aria-label="Destaque">
      <div>
        <span className="demo-badge is-wide">{highlight.fromList ? "DA SUA LISTA" : "PROMOÇÃO"} · -{discountPercent(highlight.offer)}%</span>
        <h2>{highlight.product.name} baixou pra {formatPrice(highlight.offer.priceCents)}</h2>
        <p>{highlight.store.name} · {highlight.store.floor} · termina em <strong>{countdown}</strong></p>
        <button type="button" className="demo-light-button" onClick={() => navigate(`/mapa?loja=${highlight.store.id}`)}><Icon name="navigate" size={18} />Me leve lá</button>
      </div>
      <span className="demo-highlight-art" style={{background: highlight.product.ink}}><ProductGlyph glyph={highlight.product.glyph} color="#fff" size={72} /></span>
    </section>}

    <section className="demo-section">
      <div className="demo-section-head"><h2>Você também pode gostar</h2><AppLink to="/buscar?todos=1" className="demo-link">Ver tudo</AppLink></div>
      <ul className="demo-carousel">
        {recs.map(({product, offer}) => <li key={product.id} className="demo-rec">
          <AppLink to={"/buscar?q=" + encodeURIComponent(product.name)} className="demo-rec-art"><ProductTile product={product} discount={discountPercent(offer)} size={150} glyphSize={56} /></AppLink>
          <WishButton productId={product.id} label={product.name} className="demo-heart is-floating" />
          <strong>{product.name}</strong><span>{formatPrice(offer.priceCents)} · {STORES.find(s => s.id === offer.storeId).name}</span>
        </li>)}
      </ul>
    </section>
    <DemoNotice compact />
    <NearbyOfferSheet account={account} />
  </DemoPage>;
}

