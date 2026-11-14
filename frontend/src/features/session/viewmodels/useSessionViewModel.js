import {useState,useCallback,useEffect,useRef} from "react";
import {sessionRepository} from "../repositories/session.repository.js";
export function useSessionViewModel(){
 const [session,setSession]=useState(null);const [error,setError]=useState(null);const [loading,setLoading]=useState(true);const revision=useRef(0);
 const refresh=useCallback(async()=>{const current=++revision.current;setLoading(true);try{const value=await sessionRepository.current();if(current===revision.current){setSession(value);setError(null);}return value;}catch(e){if(e.status===401){if(current===revision.current){setSession({authenticated:false});setError(null);}return {authenticated:false};}if(current===revision.current)setError(e);throw e;}finally{if(current===revision.current)setLoading(false);}},[]);
 useEffect(()=>{refresh().catch(()=>{});},[refresh]);
 useEffect(()=>{const expired=()=>refresh().catch(()=>{});const restored=event=>{if(event.persisted)expired();};window.addEventListener("app:private-session-expired",expired);window.addEventListener("pageshow",restored);return()=>{window.removeEventListener("app:private-session-expired",expired);window.removeEventListener("pageshow",restored);};},[refresh]);
 const login=async body=>{const value=await sessionRepository.login(body);revision.current++;setSession(value);setError(null);setLoading(false);return value;};
 const logout=async()=>{await sessionRepository.logout();revision.current++;setSession({authenticated:false});setError(null);setLoading(false);};
 return {session,error,loading,refresh,login,logout};
}
