import {createContext,useContext,useEffect,useRef,useState} from "react";
import {emptyDraft} from "../models/registration.js";
import {registrationRepository as repo} from "../repositories/registration.repository.js";
const Context=createContext(null);
export function RegistrationProvider({children}){
 const [draft,setDraft]=useState(emptyDraft);const [file,setFile]=useState(null);const [config,setConfig]=useState(null);const [configError,setConfigError]=useState(null);const [configLoading,setConfigLoading]=useState(true);const [result,setResult]=useState(null);const attempt=useRef(null);const [frozen,setFrozen]=useState(false);
 async function loadConfig(signal){setConfigLoading(true);try{const v=await repo.config(signal);setConfig(v);setConfigError(null);setDraft(d=>({...d,marketing:{...d.marketing,noticeVersion:v.marketingNotice.version}}));}catch(e){if(e.name!=="AbortError")setConfigError(e);}finally{if(!signal?.aborted)setConfigLoading(false);}}
 useEffect(()=>{const abort=new AbortController();loadConfig(abort.signal);return()=>abort.abort();},[]);
 const clear=()=>{setDraft(emptyDraft());setFile(null);attempt.current=null;setFrozen(false);setResult(null);};
 const patch=values=>{if(!frozen)setDraft(d=>({...d,...values}));};
 return <Context.Provider value={{draft,setDraft,patch,file,setFile,config,configError,configLoading,loadConfig,result,setResult,attempt,frozen,setFrozen,clear}}>{children}</Context.Provider>;
}
export const useRegistration=()=>useContext(Context);
