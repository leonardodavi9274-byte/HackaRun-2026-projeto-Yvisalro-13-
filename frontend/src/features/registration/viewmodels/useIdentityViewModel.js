import {useRef,useState} from "react";
import {registrationRepository as repo} from "../repositories/registration.repository.js";
let confirmationToken=null;
if(typeof location!=="undefined"&&location.pathname==="/cadastro/confirmar"){
 const values=new URLSearchParams(location.hash.slice(1));confirmationToken=values.get("token_hash");
 if(location.hash)history.replaceState(history.state,"",location.pathname);
}
export function useIdentityViewModel(onAuthenticated){
 const [token,setToken]=useState(confirmationToken);const [busy,setBusy]=useState(false);const [error,setError]=useState(null);const [message,setMessage]=useState("");const [until,setUntil]=useState(0);const lock=useRef(false);
 async function run(work){if(lock.current)return;lock.current=true;setBusy(true);setError(null);try{return await work();}catch(e){setError(e);if(e.retryAfterSeconds)setUntil(Date.now()+e.retryAfterSeconds*1000);}finally{setBusy(false);lock.current=false;}}
 const verify=()=>run(async()=>{await repo.verify(token);confirmationToken=null;setToken(null);await onAuthenticated();});
 const resend=email=>run(async()=>{const r=await repo.resend(email);setMessage("Se houver cadastro pendente para este e-mail, a solicitação de reenvio foi aceita.");setUntil(Date.now()+r.retryAfterSeconds*1000);});
 return {token,busy,error,message,until,verify,resend};
}


export const hasPendingConfirmation=()=>Boolean(confirmationToken);
export const dismissConfirmation=()=>{confirmationToken=null;};
