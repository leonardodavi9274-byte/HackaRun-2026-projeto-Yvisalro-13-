import {useEffect,useState} from "react";
import {catalogRepository} from "../repositories/catalog.repository.js";
import {isNetworkFailure} from "../../../shared/services/http-client.js";
import {buildFilters} from "../models/search-filters.js";
const initial={q:"",categoryId:"",typeId:"",minPrice:"",maxPrice:""};
export function useCatalogSearchViewModel(){
 const [draft,setDraft]=useState(initial),[applied,setApplied]=useState({}),[attempt,setAttempt]=useState(0);
 const [categories,setCategories]=useState([]),[categoryError,setCategoryError]=useState(null);
 const [state,setState]=useState({loading:true,offers:[],suggestion:null,error:null}),[formError,setFormError]=useState(null);
 useEffect(()=>{
  const controller=new AbortController();
  catalogRepository.categories({signal:controller.signal}).then(data=>{if(!controller.signal.aborted){setCategories(data.categories);setCategoryError(null);}})
   .catch(error=>{if(!controller.signal.aborted)setCategoryError(isNetworkFailure(error)?"Sem conexão.":error.message);});
  return()=>controller.abort();
 },[attempt]);
 useEffect(()=>{
  const controller=new AbortController();setState({loading:true,offers:[],suggestion:null,error:null});
  catalogRepository.search(applied,{signal:controller.signal}).then(data=>{
   if(!controller.signal.aborted)setState({loading:false,offers:data.offers,suggestion:data.suggestion,error:null});
  }).catch(error=>{if(!controller.signal.aborted)setState({loading:false,offers:[],suggestion:null,error:isNetworkFailure(error)?"Sem conexão. Verifique sua rede.":error.message});});
  return()=>controller.abort();
 },[applied,attempt]);
 function submit(next=draft){
  try{const filters=buildFilters(next,categories);setDraft(next);setApplied(filters);setFormError(null);}
  catch(error){setFormError(error.message);}
 }
 function change(field,value){setDraft(old=>({...old,[field]:value,...(field==="categoryId"?{typeId:""}:{})}));}
 function clear(){setDraft(initial);setApplied({});setFormError(null);}
 function chooseSuggestion(){
  if(!state.suggestion)return;
  const q=state.suggestion;setDraft(old=>({...old,q}));setApplied(old=>({...old,q}));setFormError(null);
 }
 return {draft,applied,categories,categoryError,state,formError,change,submit,clear,chooseSuggestion,retry:()=>setAttempt(x=>x+1)};
}
