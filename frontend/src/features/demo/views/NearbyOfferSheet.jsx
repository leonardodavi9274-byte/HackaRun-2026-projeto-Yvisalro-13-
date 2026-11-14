import {useEffect, useId, useRef, useState} from "react";
import {navigate} from "../../../app/navigation.js";
import {Icon} from "../../../shared/components/Icon.jsx";
import {useOptionalActiveRoute} from "../../mall-map/viewmodels/ActiveRouteProvider.jsx";
import {promotionRepository} from "../../nearby-promotions/repositories/promotion.repository.js";
import {DEMO_MALL, PRODUCTS, categoryLabel, storeById} from "../data/catalog.js";
import {formatPrice} from "../models/catalog-model.js";
import {useDemoStore} from "../viewmodels/DemoStore.jsx";
import {ProductGlyph, StoreBadge} from "./ProductGlyph.jsx";

/** Uma oferta por carregamento da página, como na sessão de promoções da feature 008. */
let shownThisVisit = false;
const CATEGORY_GLYPH = {eletronicos: "headphones", tenis: "shoe", "cafe-doces": "cup", beleza: "bottle", moda: "shirt", casa: "pot"};

/**
 * Tela 11 — oferta próxima sobre o Início. As ofertas vêm da API (/promotions, em modo
 * demonstração servidas em memória); distância simulada a partir da entrada do mapa fictício.
 * Nunca aparece com rota ativa (FR da feature 008).
 */
export function NearbyOfferSheet({account}) {
  const store = useDemoStore(), route = useOptionalActiveRoute();
  const [offer, setOffer] = useState(null);
  const titleId = useId(), dismissRef = useRef(null), sheetRef = useRef(null);
  const routeActive = Boolean(route?.isActive);

  useEffect(() => {
    if (shownThisVisit || routeActive) return;
    const abort = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const {offers} = await promotionRepository.list(DEMO_MALL.id, abort.signal);
        const candidates = offers.filter(o => !store.dismissedOffers.includes(o.id))
          .map(o => ({...o, store: storeById(o.storeId), interest: account.categoryIds.includes(o.categoryId)}))
          .filter(o => o.store)
          .sort((a, b) => b.interest - a.interest || a.store.distanceM - b.store.distanceM);
        if (!candidates[0] || abort.signal.aborted) return;
        shownThisVisit = true;
        setOffer(candidates[0]);
      } catch { /* sem oferta: o Início continua normal */ }
    }, 2500);
    return () => { clearTimeout(timer); abort.abort(); };
  }, [routeActive]);

  useEffect(() => { if (offer) dismissRef.current?.focus(); }, [offer]);
  if (!offer || routeActive) return null;

  const product = PRODUCTS.find(p => p.offers.some(o => o.storeId === offer.storeId) && p.name === offer.productName);
  const discount = offer.previousPriceCents ? Math.round((1 - offer.priceCents / offer.previousPriceCents) * 100) : 0;
  const until = offer.endsAt ? new Date(offer.endsAt) : null;
  const untilLabel = until && until.toDateString() === new Date().toDateString() ? `ATÉ ${until.getHours()}H` : "OFERTA";
  const dismiss = () => { store.dismissOffer(offer.id); setOffer(null); };

  function onKeyDown(event) {
    if (event.key === "Escape") { event.preventDefault(); dismiss(); return; }
    if (event.key !== "Tab") return;
    const buttons = [...sheetRef.current.querySelectorAll("button")];
    if (event.shiftKey && document.activeElement === buttons[0]) { event.preventDefault(); buttons.at(-1).focus(); }
    else if (!event.shiftKey && document.activeElement === buttons.at(-1)) { event.preventDefault(); buttons[0].focus(); }
  }

  return <div className="demo-sheet-backdrop" onClick={e => { if (e.target === e.currentTarget) dismiss(); }}>
    <section ref={sheetRef} className="demo-offer-sheet" role="dialog" aria-modal="true" aria-labelledby={titleId} onKeyDown={onKeyDown}>
      <div className="demo-offer-hero" style={{background: offer.store.color}}>
        <span className="demo-offer-store"><StoreBadge store={offer.store} size={26} />{offer.store.name}</span>
        <button type="button" className="demo-offer-close" aria-label="Fechar oferta" onClick={dismiss}><Icon name="close" size={22} /></button>
        <ProductGlyph glyph={product?.glyph ?? CATEGORY_GLYPH[offer.categoryId] ?? "bag"} color="#f5e6da" size={110} />
        {discount > 0 && <span className="demo-burst">-{discount}%<small>{untilLabel}</small></span>}
      </div>
      <div className="demo-offer-body">
        <p className="demo-offer-distance"><Icon name="pin" size={18} />VOCÊ ESTÁ A {offer.store.distanceM} M</p>
        <h2 id={titleId}>{offer.productName} por {formatPrice(offer.priceCents)}</h2>
        <p className="demo-offer-reason">{offer.interest ? `Você marcou interesse em ${categoryLabel(offer.categoryId)}. ` : ""}Oferta da {offer.store.name}, no {offer.store.floor}{offer.previousPriceCents ? ` — antes ${formatPrice(offer.previousPriceCents)}` : ""}.</p>
        <div className="demo-offer-actions">
          <button ref={dismissRef} type="button" className="secondary-button" onClick={dismiss}>Agora não</button>
          <button type="button" className="primary-button" onClick={() => { setOffer(null); navigate(`/mapa?loja=${offer.storeId}`); }}><Icon name="navigate" size={18} />Me leve lá</button>
        </div>
        <p className="demo-offer-foot">Não exibimos esse aviso enquanto você segue uma rota. Distância simulada · oferta fictícia.</p>
      </div>
    </section>
  </div>;
}
