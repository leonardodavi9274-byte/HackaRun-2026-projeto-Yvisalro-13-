import {HomeSectionState} from "./HomeSectionState.jsx";
import {isExpired} from "../models/home.js";
export function StoryRail({section,now,onOpen,onRetry}){
 return <section className="home-section" aria-labelledby="home-stories-title">
  <div className="home-section-heading"><h2 id="home-stories-title">Stories das lojas</h2></div>
  <HomeSectionState section={section} label="stories" emptyMessage="Nenhum story promocional está publicado agora." onRetry={onRetry} placeholders={5} shape="circle"/>
  {section.status==="ready"&&<ul className="story-rail home-rail" aria-label="Stories promocionais">
   {section.items.map(story=>{const expired=isExpired(story.validUntil,now);return <li key={story.id}>
    <button type="button" className={"story-chip"+(expired?" is-expired":"")} onClick={e=>onOpen(story,e.currentTarget)}>
     <span className="story-ring" aria-hidden="true">{story.imageUrl?<img src={story.imageUrl} alt="" loading="lazy" onError={e=>{e.currentTarget.hidden=true;}}/>:<span>{story.store.name.slice(0,1)}</span>}</span>
     <span className="story-store">{story.store.name}</span>
     <span className="story-title">{story.title}</span>
     {(story.isDemo||expired)&&<span className="story-meta">{[story.isDemo&&"Demonstração",expired&&"Expirado"].filter(Boolean).join(" · ")}</span>}
    </button>
   </li>;})}
  </ul>}
 </section>;
}
