import {useCallback,useRef,useState} from "react";
import {registrationRepository as repo} from "../repositories/registration.repository.js";
import {useRegistration} from "./RegistrationProvider.jsx";
import {isBound} from "../models/registration-attempt.js";
import {errorFields} from "../models/registration.js";
export function useOnboardingViewModel(){
 const c=useRegistration();const [data,setData]=useState(null);const [error,setError]=useState(null);const [fields,setFields]=useState({});const [busy,setBusy]=useState(false);const key=useRef(null);const lock=useRef(false);
 const load=useCallback(async()=>{const value=await repo.pending();setData(value);return value;},[]);
 async function run(work){if(lock.current)return;lock.current=true;setBusy(true);setError(null);setFields({});try{return await work();}catch(e){setError(e);setFields(errorFields(e));}finally{setBusy(false);lock.current=false;}}
 const check=()=>run(async()=>{if(!c.attempt.current)return;const value=await repo.status(c.attempt.current);c.setResult(value);if(isBound(value.onboarding)){c.attempt.current.credential="";c.setDraft(d=>({...d,password:""}));}return value;});
 const complete=corrections=>run(async()=>{const input=JSON.stringify(corrections??{});if(!key.current||key.current.input!==input)key.current={input,id:crypto.randomUUID()};const result=await repo.complete(key.current.id,corrections);c.setResult(result);await load();return result;});
 return {...c,data,error,fields,busy,load,run,check,complete};
}
