import {useEffect, useMemo, useState} from "react";
import {navigate, useSearchParam} from "../../../app/navigation.js";
import {Icon} from "../../../shared/components/Icon.jsx";
import {STORES} from "../data/catalog.js";
import {discountPercent, formatPrice, storiesByStore} from "../models/catalog-model.js";
import {useDemoStore} from "../viewmodels/DemoStore.jsx";
import {ProductGlyph} from "./ProductGlyph.jsx";

const DURATION = 7000;

/** Tela 07 — Story promocional. Avança sozinho, por toque nas laterais ou pelas setas do teclado. */
export function StoryView() {
  const demo = useDemoStore(), storeParam = useSearchParam("loja");
  const byStore = useMemo(storiesByStore, []);
  const order = STORES.filter(s => byStore.has(s.id)).map(s => s.id);
  const [storeId, setStoreId] = useState(byStore.has(storeParam) ? storeParam : order[0]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const stories = byStore.get(storeId) ?? [], story = stories[index];

  const close = () => (history.length > 1 ? history.back() : navigate("/inicio"));
  function next() {
    if (index < stories.length - 1) { setIndex(index + 1); return; }
    const following = order[order.indexOf(storeId) + 1];
    if (following) { setStoreId(following); setIndex(0); } else close();
  }
  function previous() {
    if (index > 0) { setIndex(index - 1); return; }
    const before = order[order.indexOf(storeId) - 1];
    if (before) { setStoreId(before); setIndex(byStore.get(before).length - 1); }
  }

  useEffect(() => {
    if (paused || !story || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setTimeout(next, DURATION);
    return () => clearTimeout(timer);
  }, [storeId, index, paused]);
  useEffect(() => {
    const onKey = e => { if (e.key === "ArrowRight") next(); else if (e.key === "ArrowLeft") previous(); else if (e.key === "Escape") close(); };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  });

  if (!story) return <main className="demo-story-page"><p>Sem stories no momento.</p><button className="primary-button" onClick={close}>Voltar</button></main>;
  const {product, offer, store} = story, discount = discountPercent(offer), wished = demo.isWished(product.id);

  return <main className="demo-story-page" style={{"--story": store.color}} aria-roledescription="story" aria-label={`Stories da ${store.name}`}>
    <div className="demo-story-progress" aria-hidden="true">
      {stories.map((s, i) => <span key={s.id}><span className={i < index ? "is-done" : i === index ? (paused ? "is-paused is-active" : "is-active") : ""} style={{animationDuration: DURATION + "ms"}} /></span>)}
    </div>
    <header className="demo-story-head">
      <span className="demo-story-avatar" style={{background: store.color}}>{store.initials}</span>
      <div><strong>{store.name}</strong><span>{store.distanceM} m · {store.floor} · há {story.postedHoursAgo} h</span></div>
      <button type="button" className="demo-story-pause" aria-label={paused ? "Continuar" : "Pausar"} onClick={() => setPaused(p => !p)}><Icon name={paused ? "play" : "pause"} size={22} /></button>
      <button type="button" className="demo-story-close" aria-label="Fechar stories" onClick={close}><Icon name="close" size={26} /></button>
    </header>
    <div className="demo-story-stage">
      <button type="button" className="demo-story-tap is-left" aria-label="Story anterior" onClick={previous} />
      <div className="demo-story-art" style={{background: product.ink}}>
        <ProductGlyph glyph={product.glyph} color="#ece4ff" size={170} />
      </div>
      {discount > 0 && <span className="demo-burst is-story">-{discount}%{story.badge && <small>{story.badge}</small>}</span>}
      <button type="button" className="demo-story-tap is-right" aria-label="Próximo story" onClick={next} />
    </div>
    <section className="demo-story-info" aria-live="polite">
      <h1>{story.headline ?? product.name}</h1>
      {story.headline && <p className="demo-story-product">{product.name}</p>}
      <p className="demo-story-price">{formatPrice(offer.priceCents)}{offer.previousCents && <s>{formatPrice(offer.previousCents)}</s>}</p>
      <p className="demo-story-valid">{story.validity}{offer.stock > 0 ? ` (${offer.stock} un.)` : ""}</p>
      <div className="demo-story-actions">
        <button type="button" className="demo-light-button is-wide" onClick={() => navigate(`/mapa?loja=${store.id}`)}><Icon name="navigate" size={20} />Me leve até a loja</button>
        <button type="button" className="demo-story-heart" aria-pressed={wished} aria-label={wished ? "Remover dos desejos" : "Salvar nos desejos"} onClick={() => demo.toggleWish(product.id)}>
          <Icon name="heart" size={24} fill={wished ? "currentColor" : "none"} /></button>
      </div>
      <p className="demo-story-hint">Toque nas laterais para ver o próximo · {index + 1} de {stories.length}</p>
    </section>
  </main>;
}
