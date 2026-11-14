import {useEffect,useState} from "react";
import {AuthLayout} from "./AuthLayout.jsx";
import {useRegistration} from "../viewmodels/RegistrationProvider.jsx";
import {useIdentityViewModel} from "../viewmodels/useIdentityViewModel.js";
import {useOnboardingViewModel} from "../viewmodels/useOnboardingViewModel.js";
import {ResumeRegistrationView} from "./ResumeRegistrationView.jsx";
import {FormFeedback} from "../../../shared/components/FormFeedback.jsx";
import {FormField} from "../../../shared/components/FormField.jsx";
import {AppLink} from "../../../app/Link.jsx";
import {navigate} from "../../../app/navigation.js";
export function ConfirmationView({auth}){
 const reg=useRegistration();const resume=useOnboardingViewModel();const vm=useIdentityViewModel(async()=>{await auth.refresh();});const [email,setEmail]=useState(reg.draft.email);const [now,setNow]=useState(Date.now());
 useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(timer);},[]);
 const wait=Math.max(0,Math.ceil((vm.until-now)/1000));const state=reg.result?.onboarding;
 const done=()=>{reg.clear();navigate("/inicio",{replace:true});};
 if(auth.session?.authenticated&&!vm.token)return <AuthLayout title="Sua conta, do seu jeito" description="Conclua apenas o que ainda está pendente." onBack={()=>navigate("/entrar")}><ResumeRegistrationView auth={auth} onComplete={done}/></AuthLayout>;
 return <AuthLayout title={vm.token?"Confirme seu e-mail":state?.status==="unknown"||state?.status==="processing"?"Vamos consultar seu cadastro":"Confirme seu e-mail"} description={vm.token?"Confirme para continuar com a conta vinculada a este e-mail.":"Use a confirmação recebida por e-mail para continuar. Se já confirmou, entre na mesma conta."} onBack={()=>navigate("/entrar")}>
 <FormFeedback message={vm.error?.message||resume.error?.message}/><FormFeedback tone="info" message={vm.message}/>
 {vm.token&&<button className="primary-button" onClick={vm.verify} disabled={vm.busy}>{vm.busy?"Confirmando…":"Confirmar e-mail"}</button>}
 {["unknown","processing"].includes(state?.status)&&<div className="status-card"><p>Não foi possível confirmar a conclusão. Consulte a situação antes de tentar novamente.</p><button className="secondary-button" onClick={resume.check} disabled={resume.busy}>{resume.busy?"Consultando…":"Consultar situação"}</button><button className="text-button" onClick={()=>navigate("/cadastro/preferencias")} disabled={resume.busy}>Voltar à tentativa em aberto</button></div>}
 <form className="auth-form" onSubmit={e=>{e.preventDefault();vm.resend(email);}} style={{marginTop:24}}><FormField id="confirmation-email" label="E-mail do cadastro" type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)}/><button className="secondary-button" disabled={vm.busy||wait>0}>{wait?("Reenviar em "+wait+"s"):"Solicitar reenvio"}</button></form>
 <div className="auth-actions"><button className="primary-button" onClick={()=>auth.refresh().then(s=>{if(!s.authenticated)navigate("/entrar");}).catch(()=>{})}>Continuar após confirmar</button><p className="legal-note"><AppLink to="/entrar">Entrar na minha conta</AppLink></p></div>
 </AuthLayout>;
}
