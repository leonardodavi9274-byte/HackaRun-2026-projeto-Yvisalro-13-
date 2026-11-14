import {useRef,useState} from "react";
import {DemoBadge,HomeSectionState} from "./HomeSectionState.jsx";
import {OfferImage,OfferPrice} from "./FeaturedOffers.jsx";
import {isExpired,stockLabel} from "../models/home.js";

const reducedMotion=()=>window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// Um trilho por carrossel: ordem recebida, sem repetição, sem avanço automático.
// Anterior/Próximo e as setas do teclado alcançam todos os itens sem depender de arrastar.
function Carousel({carousel,now,onOpenOffer,onSearch}){
 const [index,setIndex]=useState(0),list=useRef(null),total=carousel.products.length,titleId="home-carousel-"+carousel.id;
 const go=(next,focus=false)=>{
  const target=Math.max(0,Math.min(total-1,next));setIndex(target);
  const el=list.current?.children[target];
  el?.scrollIntoView({behavior:reducedMotion()?"auto":"smooth",block:"nearest",inline:"start"});
  if(focus)el?.querySelector("button")?.focus({preventScroll:true});
 };
 const onKeyDown=(e,i)=>{
  const keys={ArrowRight:i+1,ArrowLeft:i-1,Home:0,End:total-1};
  if(e.key in keys){e.preventDefault();go(keys[e.key],true);}
 };
 return <section className="home-section" aria-labelledby={titleId} aria-roledescription="carrossel">
  <div className="home-section-heading">
   <h2 id={titleId}>{carousel.title}</h2>
   {total>1&&<div className="carousel-controls">
    <span className="carousel-position" aria-live="polite">Item {index+1} de {total}</span>
    <button type="button" onClick={()=>go(index-1)} disabled={index===0} aria-label={"Anterior em "+carousel.title}>‹ Anterior</button>
    <button type="button" onClick={()=>go(index+1)} disabled={index>=total-1} aria-label={"Próximo em "+carousel.title}>Próximo ›</button>
   </div>}
  </div>
  <ul className="product-rail home-rail" ref={list}>
   {carousel.products.map(({product,offer,isDemo},i)=>{const expired=offer&&isExpired(offer.validUntil,now);return <li key={product.id}>
    <button type="button" className={"product-card"+(expired?" is-expired":"")} onFocus={()=>setIndex(i)} onKeyDown={e=>onKeyDown(e,i)}
     onClick={e=>offer?onOpenOffer(offer,e.currentTarget):onSearch(product.name)}>
     <OfferImage product={product} className="product-image"/>
     <DemoBadge show={isDemo}/>
     <span className="offer-name">{product.name}</span>
     {offer
      ?<><OfferPrice offer={offer}/><span className="offer-store">{offer.store.name}</span><span className="stock-label">{expired?"Oferta expirada":stockLabel(offer.stockStatus)}</span></>
      :<span className="product-no-offer">Sem oferta vigente · buscar produto</span>}
    </button>
   </li>;})}
  </ul>
 </section>;
}

export function ProductCarousel({section,now,onOpenOffer,onSearch,onRetry}){
 if(section.status!=="ready")return <section className="home-section" aria-labelledby="home-carousels-title">
  <div className="home-section-heading"><h2 id="home-carousels-title">Descubra mais</h2></div>
  <HomeSectionState section={section} label="carrosséis" emptyMessage="Ainda não há seleções de produtos publicadas." onRetry={onRetry} placeholders={4}/>
 </section>;
 return <>{section.items.map(c=><Carousel key={c.id} carousel={c} now={now} onOpenOffer={onOpenOffer} onSearch={onSearch}/>)}</>;
}
