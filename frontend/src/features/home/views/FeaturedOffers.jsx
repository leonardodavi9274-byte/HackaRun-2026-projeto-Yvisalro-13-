import {DemoBadge,HomeSectionState} from "./HomeSectionState.jsx";
import {discountPercent,formatDateTime,formatMoney,isExpired,stockLabel,storeLabel} from "../models/home.js";

// Preço anterior e desconto só aparecem quando o modelo garantiu coerência (anterior > atual).
export function OfferPrice({offer}){
 const discount=discountPercent(offer.priceCents,offer.previousPriceCents);
 return <span className="offer-price">
  {offer.previousPriceCents&&<><span className="visually-hidden">De </span><del>{formatMoney(offer.previousPriceCents)}</del>{" "}<span className="visually-hidden">por </span></>}
  <strong>{formatMoney(offer.priceCents)}</strong>
  {discount&&<span className="offer-discount">{discount}% menos</span>}
 </span>;
}
// Estado em texto (não só cor): expirada, estoque e validade quando conhecida.
export function OfferStatus({offer,now}){
 const expired=isExpired(offer.validUntil,now);
 return <span className="offer-status">
  <span className={"stock-label stock-"+(expired?"expired":offer.stockStatus)}>{expired?"Oferta expirada":stockLabel(offer.stockStatus)}</span>
  {offer.validUntil&&!expired&&<span>Válida até {formatDateTime(offer.validUntil)}</span>}
 </span>;
}
export function OfferImage({product,className="offer-image"}){
 return product.imageUrl?<img className={className} src={product.imageUrl} alt={product.imageAlt} loading="lazy" onError={e=>{e.currentTarget.hidden=true;}}/>:null;
}

export function FeaturedOffers({section,now,onOpen,onRetry}){
 return <section className="home-section" aria-labelledby="home-offers-title">
  <div className="home-section-heading"><h2 id="home-offers-title">Ofertas em destaque</h2></div>
  <HomeSectionState section={section} label="ofertas" emptyMessage="Nenhuma oferta em destaque está vigente agora." onRetry={onRetry} placeholders={3}/>
  {section.status==="ready"&&<ul className="offer-grid">
   {section.items.map(offer=>{const expired=isExpired(offer.validUntil,now);return <li key={offer.offerId}>
    <button type="button" className={"offer-card"+(expired?" is-expired":"")} onClick={e=>onOpen(offer,e.currentTarget)}>
     <OfferImage product={offer.product}/>
     <span className="offer-card-body">
      <DemoBadge show={offer.isDemo}/>
      <span className="offer-name">{offer.product.name}</span>
      <OfferPrice offer={offer}/>
      <span className="offer-store">{storeLabel(offer.store)}</span>
      <OfferStatus offer={offer} now={now}/>
     </span>
    </button>
   </li>;})}
  </ul>}
 </section>;
}
