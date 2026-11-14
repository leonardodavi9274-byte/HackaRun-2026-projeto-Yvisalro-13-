import {useRef,useState} from "react";
import {useRegistration} from "./RegistrationProvider.jsx";
import {validateAccount,errorFields} from "../models/registration.js";
import {createAttempt,isBound} from "../models/registration-attempt.js";
import {registrationRepository as repo} from "../repositories/registration.repository.js";
import {navigate} from "../../../app/navigation.js";
export function useRegistrationViewModel(){
 const context=useRegistration();const {draft,config,attempt,setFrozen,setResult,setDraft}=context;const [fields,setFields]=useState({});const [error,setError]=useState(null);const [busy,setBusy]=useState(false);const locked=useRef(false);
 function next(account){if(context.frozen)return;const current=account?{...draft,...account}:draft;if(account)context.patch(account);if(context.photoPreparing){setError({message:"Aguarde a prévia da foto antes de continuar."});return;}const f=validateAccount(current);setFields(f);if(Object.keys(f).length){setError({message:"Revise os campos indicados."});return;}if(!config){setError({message:"O cadastro está temporariamente indisponível."});return;}setError(null);navigate("/cadastro/preferencias");}
 async function submit(mode){if(locked.current||context.photoPreparing)return;const f=validateAccount(draft);if(Object.keys(f).length&&!attempt.current){setFields(f);navigate("/cadastro");return;}if(!config)return;
 locked.current=true;setBusy(true);setError(null);setFields({});setFrozen(true);attempt.current??=createAttempt({...draft,photoRequested:Boolean(context.file)},mode);context.setFileOwner(attempt.current.snapshot.email);
 try{const value=await repo.create(attempt.current);setResult(value);if(isBound(value.onboarding)){attempt.current.credential="";setDraft(d=>({...d,password:""}));}navigate("/cadastro/confirmar");}
 catch(e){setError(e);setFields(errorFields(e));if([400,422].includes(e.status)||e.code==="REGISTRATION_NOT_COMPLETED"||e.code==="NOTICE_VERSION_CHANGED"){attempt.current=null;setFrozen(false);}else {setResult({onboarding:{status:"unknown",pendingActions:["check_status"],preferredNextAction:"check_status"}});}}
 finally{locked.current=false;setBusy(false);}
 }
 return {...context,fields,error,busy,next,submit};
}
