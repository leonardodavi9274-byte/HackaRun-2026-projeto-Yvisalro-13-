import {useCallback,useEffect,useState} from "react";
import {homeRepository} from "../repositories/home.repository.js";
import {createClock,loadingSections} from "../models/home.js";

const FAILURE="Não foi possível carregar a tela inicial. Verifique sua conexão e tente novamente.";
const TICK_MS=30000;

// Tela inicial pública: não depende da sessão. Nova tentativa refaz o agregado e
// preserva o conteúdo já carregado se a nova consulta falhar.
export function useHomeViewModel(){
 const [attempt,setAttempt]=useState(0);
 const [state,setState]=useState({status:"loading",content:null,error:null,refreshing:false,clock:null});
 const [now,setNow]=useState(()=>Date.now());
 useEffect(()=>{
  const controller=new AbortController();
  setState(s=>({...s,status:s.content?s.status:"loading",refreshing:Boolean(s.content),error:null}));
  homeRepository.get({signal:controller.signal})
   .then(content=>{if(controller.signal.aborted)return;const clock=createClock(content.generatedAt);setState({status:"ready",content,error:null,refreshing:false,clock});setNow(clock());})
   .catch(()=>{if(!controller.signal.aborted)setState(s=>({...s,status:s.content?"ready":"error",error:FAILURE,refreshing:false}));});
  return()=>controller.abort();
 },[attempt]);
 // Reavalia validade enquanto a tela está aberta, sem buscar novos dados.
 useEffect(()=>{if(!state.clock)return;const id=setInterval(()=>setNow(state.clock()),TICK_MS);return()=>clearInterval(id);},[state.clock]);
 const retry=useCallback(()=>setAttempt(v=>v+1),[]);
 const sections=state.content?.sections??loadingSections();
 return {status:state.status,content:state.content,sections,error:state.error,refreshing:state.refreshing,now,retry};
}
