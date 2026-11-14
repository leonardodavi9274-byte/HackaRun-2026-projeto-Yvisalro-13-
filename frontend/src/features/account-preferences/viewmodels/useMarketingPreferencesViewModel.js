import {useState,useEffect,useRef,useCallback} from "react";
import {accountPreferencesRepository as repo} from "../repositories/account-preferences.repository.js";
export function useMarketingPreferencesViewModel(){
 const [saved,setSaved]=useState(null),[draft,setDraft]=useState(false),[error,setError]=useState(null),[message,setMessage]=useState(""),[busy,setBusy]=useState(false),[loading,setLoading]=useState(true);const key=useRef(null),lock=useRef(false);
 const load=useCallback(async()=>{setLoading(true);try{const v=await repo.get();setSaved(v.marketing);setDraft(v.marketing.allowed);setError(null);}catch(e){setError(e);}finally{setLoading(false);}},[]);
 useEffect(()=>{load();},[load]);
 async function save(){if(!saved||lock.current)return;lock.current=true;setBusy(true);setMessage("");setError(null);const input=JSON.stringify({allowed:draft,noticeVersion:saved.noticeVersion});if(!key.current||key.current.input!==input)key.current={input,id:crypto.randomUUID()};
 try{const v=await repo.save(draft,saved.noticeVersion,key.current.id);setSaved(v.marketing);setDraft(v.marketing.allowed);setMessage("Sua preferência foi confirmada no serviço.");}catch(e){setError(e);}finally{setBusy(false);lock.current=false;}}
 return {saved,draft,setDraft,error,message,busy,loading,load,save};
}
