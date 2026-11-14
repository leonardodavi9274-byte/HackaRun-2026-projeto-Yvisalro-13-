import {useRef,useState} from "react";
import {useRegistration} from "./RegistrationProvider.jsx";
import {photoRepository as repo} from "../repositories/photo.repository.js";
export function usePhotoViewModel(email,onResult){
 const c=useRegistration();const file=c.fileOwner===email?c.file:null;const [busy,setBusy]=useState(false),[error,setError]=useState(null),[message,setMessage]=useState("");const key=useRef(null),lock=useRef(false);
 const select=file=>{c.setFile(file);c.setFileOwner(file?email:null);setError(null);setMessage("");};
 async function run(kind){if(lock.current||kind==="upload"&&!file)return;lock.current=true;setBusy(true);setError(null);const fingerprint=kind==="upload"?file:"waive";if(!key.current||key.current.input!==fingerprint||key.current.email!==email)key.current={input:fingerprint,email,id:crypto.randomUUID()};
 try{const result=await(kind==="upload"?repo.save(file,key.current.id):repo.waive(key.current.id));setMessage(result.receipt?.superseded?"Uma escolha mais recente foi mantida.":"Sua escolha de foto foi confirmada.");c.setResult(result);await onResult(result);}catch(e){setError(e);}finally{setBusy(false);lock.current=false;}}
 return {file,select,busy,error,message,upload:()=>run("upload"),waive:()=>run("waive")};
}
