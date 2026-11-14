import {useEffect,useState} from "react";
import {AppLink} from "../../../app/Link.jsx";
import {catalogRepository} from "../repositories/catalog.repository.js";
import {isNetworkFailure} from "../../../shared/services/http-client.js";
import {mallRepository} from "../../mall-map/repositories/mall.repository.js";
import {SimilarProducts} from "./SimilarProducts.jsx";
import {OfferComparison} from "./OfferComparison.jsx";

export function VariantDetailView({variantId}){
 const [state,setState]=useState({loading:true,data:null,error:null}),[attempt,setAttempt]=useState(0);
 const [similar,setSimilar]=useState({loading:true,offers:[],error:null});
 const [stores,setStores]=useState(null),[mapLoading,setMapLoading]=useState(true);
 useEffect(()=>{
  const controller=new AbortController();
  setState({loading:true,data:null,error:null});
  catalogRepository.variant(variantId,{signal:controller.signal}).then(data=>{
   if(!controller.signal.aborted)setState({loading:false,data,error:null});
  }).catch(error=>{if(!controller.signal.aborted)setState({loading:false,data:null,error:isNetworkFailure(error)?"Sem conexão. Verifique sua rede.":error.message});});
  return()=>controller.abort();
 },[variantId,attempt]);
 useEffect(()=>{
  const controller=new AbortController();setSimilar({loading:true,offers:[],error:null});
  catalogRepository.similar(variantId,{signal:controller.signal}).then(data=>{
   if(!controller.signal.aborted)setSimilar({loading:false,offers:data.offers,error:null});
  }).catch(error=>{if(!controller.signal.aborted)setSimilar({loading:false,offers:[],error:isNetworkFailure(error)?"Sem conexão. Verifique sua rede.":error.message});});
  return()=>controller.abort();
 },[variantId,attempt]);
 useEffect(()=>{
  const controller=new AbortController();setStores(null);setMapLoading(true);
  mallRepository.load(controller.signal).then(data=>{if(!controller.signal.aborted){setStores(data.stores);setMapLoading(false);}})
   .catch(()=>{if(!controller.signal.aborted){setStores(null);setMapLoading(false);}});
  return()=>controller.abort();
 },[variantId,attempt]);
 return <main className="catalog-page">
  <AppLink to="/buscar">Voltar à busca</AppLink>
  {state.loading&&<p role="status">Carregando produto…</p>}
  {state.error&&<div role="alert"><p>{state.error}</p><button onClick={()=>setAttempt(x=>x+1)}>Tentar novamente</button></div>}
  {state.data&&<><h1>{state.data.product.name}</h1><p>{state.data.variant.label}</p>
   {state.data.product.isDemo&&<p className="catalog-demo">Produto fictício de demonstração</p>}
   <OfferComparison offers={state.data.offers} stores={stores} mapLoading={mapLoading}/>
   {similar.loading&&<p role="status">Carregando semelhantes…</p>}
   {similar.error&&<div role="alert"><p>{similar.error}</p><button onClick={()=>setAttempt(x=>x+1)}>Tentar novamente</button></div>}
   {!similar.loading&&!similar.error&&<SimilarProducts offers={similar.offers}/>}
  </>}
 </main>;
}
