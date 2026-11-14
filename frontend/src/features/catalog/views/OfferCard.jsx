import {AppLink} from "../../../app/Link.jsx";
export const money=cents=>cents===null?"Preço desconhecido":new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(cents/100);
export const availabilityLabel=value=>({available:"Disponível",unavailable:"Esgotado",unknown:"Disponibilidade desconhecida"})[value]||"Disponibilidade desconhecida";
export const promotionEnd=promotion=>promotion?.endsAt?new Date(promotion.endsAt).toLocaleString("pt-BR"):null;
export function OfferCard({offer}){
 return <article className="catalog-card">
  <h3>{offer.product.name}</h3>
  <p className="catalog-store">Loja: {offer.store.name}</p>
  <p>{offer.variant.label}</p>
  <strong>{money(offer.priceCents)}</strong>
  {offer.offerState==="upcoming"&&<p>Oferta ainda não vigente.</p>}
  {offer.offerState==="expired"&&<p>Oferta fora da vigência.</p>}
  {offer.promotion&&<p>Antes: {money(offer.promotion.previousPriceCents)}</p>}
  {promotionEnd(offer.promotion)&&<p>Válida até: {promotionEnd(offer.promotion)}</p>}
  <p>{availabilityLabel(offer.availability)}</p>
  {offer.isDemo&&<p className="catalog-demo">Oferta fictícia de demonstração</p>}
  <AppLink to={"/produto/"+encodeURIComponent(offer.variant.id)}>Ver produto e ofertas</AppLink>
 </article>;
}
