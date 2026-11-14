import {useState} from "react";
import {HomeDialog} from "./HomeDialog.jsx";
import {DemoBadge} from "./HomeSectionState.jsx";
import {OfferPrice} from "./FeaturedOffers.jsx";
import {formatDateTime,isExpired,storeLabel} from "../models/home.js";
// Story em diálogo: sem avanço automático nem barra de tempo.
export function StoryViewer({story,now,returnFocus,onClose,onOpenOffer}){
 const [imageFailed,setImageFailed]=useState(false),expired=isExpired(story.validUntil,now);
 return <HomeDialog titleId="home-story-title" returnFocus={returnFocus} onClose={onClose} className="story-dialog">
  <p className="story-dialog-store">{storeLabel(story.store)}</p>
  {story.imageUrl&&!imageFailed
   ?<img className="story-image" src={story.imageUrl} alt={story.imageAlt} onError={()=>setImageFailed(true)}/>
   :<p className="story-image story-image-missing">Imagem do story indisponível.</p>}
  <DemoBadge show={story.isDemo}/>
  <h2 id="home-story-title">{story.title}</h2>
  <p className={"offer-status"}>{expired?<span className="stock-label stock-expired">Story expirado</span>:story.validUntil&&<span>Válido até {formatDateTime(story.validUntil)}</span>}</p>
  {story.offer&&<div className="story-offer">
   <p className="offer-name">{story.offer.product.name}</p>
   <OfferPrice offer={story.offer}/>
   <button type="button" className="home-primary-button" onClick={()=>onOpenOffer(story.offer)}>Ver oferta</button>
  </div>}
  {story.isDemo&&<p className="dialog-note">Conteúdo fictício, apenas para demonstração.</p>}
 </HomeDialog>;
}
