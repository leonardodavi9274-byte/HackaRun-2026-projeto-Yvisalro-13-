import {useEffect,useState,useCallback} from "react";
import {registrationRepository as repo} from "../repositories/registration.repository.js";
export function useInterestsViewModel(){
 const [categories,setCategories]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState(null);
 const reload=useCallback(async signal=>{setLoading(true);try{const v=await repo.categories(signal);setCategories(v.categories);setError(null);}catch(e){if(e.name!=="AbortError")setError(e);}finally{if(!signal?.aborted)setLoading(false);}},[]);
 useEffect(()=>{const abort=new AbortController();reload(abort.signal);return()=>abort.abort();},[reload]);
 return {categories,loading,error,reload};
}
