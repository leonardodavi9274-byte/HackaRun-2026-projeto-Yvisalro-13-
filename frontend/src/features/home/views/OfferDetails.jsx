import {HomeDialog} from "./HomeDialog.jsx";
import {DemoBadge} from "./HomeSectionState.jsx";
import {OfferImage,OfferPrice,OfferStatus} from "./FeaturedOffers.jsx";
import {formatDateTime,storeLabel} from "../models/home.js";
// Detalhe local da oferta: só dados recebidos; sem compra, reserva ou pagamento.
export function OfferDetails({offer,now,returnFocus,onClose}){
 return <HomeDialog titleId="home-offer-title" returnFocus={returnFocus} onClose={onClose}>
  <OfferImage product={offer.product} className="dialog-image"/>
  <DemoBadge show={offer.isDemo}/>
  <h2 id="home-offer-title">{offer.product.name}</h2>
  <OfferPrice offer={offer}/>
  <dl className="dialog-facts">
   <div><dt>Loja</dt><dd>{storeLabel(offer.store)}</dd></div>
   <div><dt>Situação</dt><dd><OfferStatus offer={offer} now={now}/></dd></div>
   {offer.lastUpdatedAt&&<div><dt>Atualizada em</dt><dd>{formatDateTime(offer.lastUpdatedAt)}</dd></div>}
  </dl>
  <p className="dialog-note">{offer.isDemo?"Oferta fictícia, apenas para demonstração. ":""}A compra acontece na loja, fora do aplicativo.</p>
 </HomeDialog>;
}
