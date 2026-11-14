import {useEffect,useId,useRef} from "react";
import {navigate} from "../../../app/navigation.js";
import "../../../styles/nearby-promotions.css";
const currency=cents=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(cents/100);
const date=value=>new Intl.DateTimeFormat("pt-BR",{dateStyle:"short",timeStyle:"short"}).format(new Date(value));
export function NearbyPromotionDialog({promotion,onDismiss,onClose,canRestoreFocus}){
 const title=useId(),dialog=useRef(null),dismiss=useRef(null),restore=useRef(canRestoreFocus);restore.current=canRestoreFocus;
 useEffect(()=>{
  const previous=document.activeElement;dismiss.current?.focus();
  return()=>{if(restore.current()){if(previous?.isConnected&&previous!==document.body)previous.focus?.();else document.querySelector(".account-shell h1")?.focus();}};
 },[]);
 function onKeyDown(event){
  if(event.key==="Escape"){event.preventDefault();onDismiss();return;}
  if(event.key!=="Tab")return;
  const buttons=Array.from(dialog.current?.querySelectorAll("button:not([disabled])")??[]);
  if(!buttons.length)return;
  if(event.shiftKey&&document.activeElement===buttons[0]){event.preventDefault();buttons.at(-1).focus();}
  else if(!event.shiftKey&&document.activeElement===buttons.at(-1)){event.preventDefault();buttons[0].focus();}
 }
 const {offer,store,distanceM,floorName,interestMatch,mapIsDemo,locationMissing}=promotion;
 return <div className="promotion-backdrop"><section ref={dialog} className="promotion-dialog" role="dialog" aria-modal="true" aria-labelledby={title} onKeyDown={onKeyDown}>
  <button type="button" className="promotion-close" aria-label="Fechar promoção" onClick={onDismiss}>×</button>
  <p className="promotion-eyebrow">{offer.isDemo?"Oferta de demonstração":"Oferta próxima"}</p>
  <h2 id={title}>Promoção próxima</h2>
  <p className="promotion-product">{offer.productName}</p>
  <p>{store.name} · {floorName}</p>
  <p><strong className="promotion-price">{currency(offer.priceCents)}</strong>{offer.previousPriceCents!==null&&<span className="promotion-previous"> Antes: {currency(offer.previousPriceCents)}</span>}</p>
  <p>Disponível</p>
  <p>{Math.round(distanceM)} m · Distância simulada a partir do ponto escolhido{mapIsDemo?" em mapa de demonstração":""}.</p>
  {interestMatch&&<p>Selecionada a partir de uma categoria do seu interesse.</p>}
  {offer.endsAt&&<p>Válida até {date(offer.endsAt)}.</p>}
  {offer.updatedAt&&<p>Atualizada em {date(offer.updatedAt)}.</p>}
  {locationMissing&&<p>Localização no mapa indisponível.</p>}
  <div className="promotion-actions"><button ref={dismiss} type="button" className="secondary-button" onClick={onDismiss}>Agora não</button>
   <button type="button" className="primary-button" disabled={locationMissing} onClick={()=>{onClose();navigate(`/mapa?loja=${encodeURIComponent(store.id)}`);}}>Me leve lá</button></div>
 </section></div>;
}
