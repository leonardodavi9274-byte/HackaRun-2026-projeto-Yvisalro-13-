import {useState} from "react";
import {navigate,searchPath} from "../../../app/navigation.js";
import {useHomeViewModel} from "../viewmodels/useHomeViewModel.js";
import {HomeHeader} from "./HomeHeader.jsx";
import {SearchBox} from "./SearchBox.jsx";
import {CategoryRail} from "./CategoryRail.jsx";
import {StoryRail} from "./StoryRail.jsx";
import {FeaturedOffers} from "./FeaturedOffers.jsx";
import {ProductCarousel} from "./ProductCarousel.jsx";
import {OfferDetails} from "./OfferDetails.jsx";
import {StoryViewer} from "./StoryViewer.jsx";
import {HomeBottomNav} from "./HomeBottomNav.jsx";

// Tela 05 — Início, pública. A sessão é opcional: falha ao consultá-la não bloqueia o conteúdo.
export function HomeView({auth,onLogout}){
 const vm=useHomeViewModel(),[detail,setDetail]=useState(null),[loggingOut,setLoggingOut]=useState(false);
 const {content,sections,now}=vm,authenticated=Boolean(auth?.session?.authenticated);
 const search=query=>navigate(searchPath({query}));
 const browseCategory=category=>navigate(searchPath({categoryId:category.id}));
 const openOffer=(offer,opener)=>setDetail(d=>({type:"offer",item:offer,opener:opener??d?.opener??null}));
 const openStory=(story,opener)=>setDetail({type:"story",item:story,opener});
 const close=()=>setDetail(null);
 const logout=async()=>{setLoggingOut(true);try{await onLogout?.();}finally{setLoggingOut(false);}};
 const demo=content&&(content.shopping?.isDemo||Object.values(sections).some(s=>s.items.some(i=>i.isDemo)));

 return <div className="home-page">
  <HomeHeader shopping={content?.shopping} authenticated={authenticated} onLogout={logout} loggingOut={loggingOut}/>
  <main className="home-shell" id="home-content" tabIndex="-1" aria-busy={vm.status==="loading"||vm.refreshing}>
   <div className="home-intro">
    <h1>O que você procura hoje?</h1>
    <p>Encontre produtos, lojas e ofertas{content?.shopping?" no "+content.shopping.name:" no shopping"}.</p>
   </div>
   <SearchBox onSearch={search}/>
   {demo&&<p className="home-demo-note"><strong>Conteúdo de demonstração.</strong> Shopping, lojas, produtos e preços exibidos são fictícios.</p>}
   {vm.error&&<div className="home-error home-banner" role="alert">
    <p>{content?"O conteúdo não foi atualizado. "+vm.error:vm.error}</p>
    <button type="button" className="home-primary-button" onClick={vm.retry}>Tentar novamente</button>
   </div>}
   {vm.refreshing&&<p className="visually-hidden" role="status">Atualizando a tela inicial…</p>}
   {vm.status!=="error"&&<>
    <CategoryRail section={sections.categories} onSelect={browseCategory} onRetry={vm.retry}/>
    <StoryRail section={sections.stories} now={now} onOpen={openStory} onRetry={vm.retry}/>
    <FeaturedOffers section={sections.featuredOffers} now={now} onOpen={openOffer} onRetry={vm.retry}/>
    <ProductCarousel section={sections.carousels} now={now} onOpenOffer={openOffer} onSearch={search} onRetry={vm.retry}/>
   </>}
  </main>
  <HomeBottomNav current="inicio"/>
  {detail?.type==="offer"&&<OfferDetails key={"o-"+detail.item.offerId} offer={detail.item} now={now} returnFocus={detail.opener} onClose={close}/>}
  {detail?.type==="story"&&<StoryViewer key={"s-"+detail.item.id} story={detail.item} now={now} returnFocus={detail.opener} onClose={close} onOpenOffer={offer=>openOffer(offer)}/>}
 </div>;
}
