import {AppLink} from "../../../app/Link.jsx";
import {availabilityLabel,money,promotionEnd} from "./OfferCard.jsx";
export function OfferComparison({offers,stores,mapLoading}){
 return <section aria-labelledby="offers-title"><h2 id="offers-title">Comparar ofertas</h2>
  {!offers.length&&<p>Nenhuma oferta disponível para esta variante.</p>}
  <div className="catalog-grid">{offers.map(o=>{
   const store=stores?.find(s=>s.id===o.store.id),canRoute=Boolean(store?.unitId&&store?.floorId);
   return <article className="catalog-card" key={o.id}>
    <h3>{o.product.name} · {o.variant.label}</h3><p className="catalog-store">Loja: {o.store.name}</p>
    <strong>{money(o.priceCents)}</strong>{o.promotion&&<p>Antes: {money(o.promotion.previousPriceCents)}</p>}
    {promotionEnd(o.promotion)&&<p>Válida até: {promotionEnd(o.promotion)}</p>}
    {o.offerState==="upcoming"&&<p>Oferta ainda não vigente.</p>}
    {o.offerState==="expired"&&<p>Oferta fora da vigência.</p>}
    <p>{availabilityLabel(o.availability)}</p>{o.isDemo&&<p className="catalog-demo">Oferta fictícia de demonstração</p>}
    {canRoute&&<p>Piso: {store.floorId}</p>}
    {mapLoading?<p role="status">Consultando localização da loja…</p>:canRoute?<AppLink to={"/mapa?loja="+encodeURIComponent(o.store.id)}>Ver loja no mapa</AppLink>:<p>Localização no mapa indisponível</p>}
   </article>;
  })}</div>
 </section>;
}
