import {useState,useCallback,useEffect} from "react";
import {sessionRepository} from "../repositories/session.repository.js";
export function useSessionViewModel(){
 const [session,setSession]=useState(null);const [error,setError]=useState(null);const [loading,setLoading]=useState(true);
 const refresh=useCallback(async()=>{setLoading(true);try{const value=await sessionRepository.current();setSession(value);setError(null);return value;}catch(e){if(e.status===401){setSession({authenticated:false});setError(null);return {authenticated:false};}setError(e);throw e;}finally{setLoading(false);}},[]);
 useEffect(()=>{refresh().catch(()=>{});},[refresh]);
 const login=async body=>{const value=await sessionRepository.login(body);setSession(value);setError(null);return value;};
 const logout=async()=>{await sessionRepository.logout();setSession({authenticated:false});};
 return {session,error,loading,refresh,login,logout};
}
