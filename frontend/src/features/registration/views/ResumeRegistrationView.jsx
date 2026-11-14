import {MarketingConsentField} from "../../account-preferences/views/MarketingConsentField.jsx";
import {CategoryGrid} from "./CategoryGrid.jsx";
import {ProductInterestInput} from "./ProductInterestInput.jsx";
import {useInterestsViewModel} from "../viewmodels/useInterestsViewModel.js";
import {useEffect,useRef,useState} from "react";
import {useOnboardingViewModel} from "../viewmodels/useOnboardingViewModel.js";
import {FormFeedback} from "../../../shared/components/FormFeedback.jsx";
import {FormField} from "../../../shared/components/FormField.jsx";
import {navigate} from "../../../app/navigation.js";
export function ResumeRegistrationView({auth,onComplete}){
 const vm=useOnboardingViewModel();const interests=useInterestsViewModel();const [correction,setCorrection]=useState(null);const auto=useRef(false);
 useEffect(()=>{vm.run(vm.load);},[vm.load]);
 const state=vm.data?.onboarding||auth.session?.onboarding;
 async function finish(input){const result=await vm.complete(input);if(result?.onboarding.status==="completed"){await auth.refresh();onComplete();}return result;}
 useEffect(()=>{if(state?.status==="ready_to_complete"&&!auto.current){auto.current=true;finish();}},[state?.status]);
 if(!vm.data)return <><FormFeedback message={vm.error?.message}/><p className="muted" role="status">{vm.busy?"Consultando seu cadastro…":"Consulte o cadastro para continuar."}</p><button className="secondary-button" onClick={()=>vm.run(vm.load)} disabled={vm.busy}>Consultar novamente</button></>;
 const pending=state?.pendingActions||[];
 return <><FormFeedback message={vm.error?.message}/><div className="status-card"><strong>{state?.status==="completed"?"Seu cadastro está concluído":state?.status==="photo_pending"?"Sua foto ainda não foi confirmada":state?.status==="ready_to_complete"?"Concluindo seu cadastro…":"Vamos concluir seu cadastro"}</strong><p>{pending.includes("complete_profile")?"Sua conta existe. Os dados do perfil ainda precisam ser salvos.":"Os dados confirmados da sua conta foram preservados."}</p></div>
 {pending.includes("complete_profile")&&<><button className="primary-button" disabled={vm.busy} onClick={()=>finish()}>Salvar dados e continuar</button>{vm.data.pendingDraft&&<button className="text-button" onClick={()=>setCorrection(vm.data.pendingDraft)}>Revisar meus dados</button>}</>}
 {correction&&<form className="auth-form" onSubmit={e=>{e.preventDefault();const {name,categoryIds,productInterests,marketing}=correction;finish({name,categoryIds,productInterests,marketing});}}><FormField id="resume-name" label="Nome" value={correction.name} onChange={e=>setCorrection(c=>({...c,name:e.target.value}))}/><CategoryGrid {...interests} selected={correction.categoryIds} onChange={categoryIds=>setCorrection(c=>({...c,categoryIds}))} onRetry={()=>interests.reload()} disabled={vm.busy}/><ProductInterestInput terms={correction.productInterests} onChange={productInterests=>setCorrection(c=>({...c,productInterests}))} disabled={vm.busy} serverError={vm.fields.productInterests}/><MarketingConsentField allowed={correction.marketing.allowed} onChange={allowed=>setCorrection(c=>({...c,marketing:{...c.marketing,allowed}}))} disabled={vm.busy}/><button type="submit" className="secondary-button" disabled={vm.busy}>Salvar correções</button></form>}
 {state?.status==="photo_pending"&&<p className="muted">Selecione novamente a foto ou continue sem ela.</p>}
 {state?.status==="ready_to_complete"&&<button className="primary-button" onClick={()=>finish()} disabled={vm.busy}>{vm.busy?"Concluindo…":"Concluir e continuar"}</button>}
 {state?.status==="completed"&&<button className="primary-button" onClick={onComplete}>Ir para o Início</button>}
 <button className="text-button" onClick={async()=>{await auth.logout();vm.clear();navigate("/entrar");}}>Sair desta conta</button></>;
}
