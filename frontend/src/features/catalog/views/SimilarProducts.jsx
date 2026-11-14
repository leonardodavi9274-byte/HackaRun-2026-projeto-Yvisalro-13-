import {OfferCard} from "./OfferCard.jsx";
export function SimilarProducts({offers}){
 return <section aria-labelledby="similar-title"><h2 id="similar-title">Produtos semelhantes</h2>
  <p>Alternativas da mesma categoria; podem ser produtos ou variantes diferentes.</p>
  {offers.length?<div className="catalog-grid">{offers.map(o=><OfferCard key={o.id} offer={o}/>)}</div>:<p>Nenhum produto semelhante disponível.</p>}
 </section>;
}
