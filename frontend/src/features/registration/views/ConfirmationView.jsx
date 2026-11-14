import {useRegistrationViewModel} from "../viewmodels/useRegistrationViewModel.js";
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
 const retryVm=useRegistrationViewModel();const reg=useRegistration();const resume=useOnboardingViewModel();const vm=useIdentityViewModel(async()=>{await auth.refresh();});const [email,setEmail]=useState(reg.draft.email);const [now,setNow]=useState(Date.now());
 useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(timer);},[]);
 const wait=Math.max(0,Math.ceil((vm.until-now)/1000));const state=reg.result?.onboarding;
 if(state?.status==="not_created")return <AuthLayout title="Vamos revisar seu cadastro" description="A conta não foi criada. Você pode corrigir os dados e tentar novamente." onBack={()=>navigate("/cadastro")}><AppLink to="/cadastro">Corrigir dados do cadastro</AppLink></AuthLayout>;
 const done=()=>{reg.clear();navigate("/inicio",{replace:true});};
 if(auth.session?.authenticated&&!vm.token)return <AuthLayout title="Sua conta, do seu jeito" description="Conclua apenas o que ainda está pendente." onBack={()=>navigate("/entrar")}><ResumeRegistrationView auth={auth} onComplete={done}/></AuthLayout>;
 return <AuthLayout title={vm.token?"Confirme seu e-mail":state?.status==="unknown"||state?.status==="processing"?"Vamos consultar seu cadastro":"Confirme seu e-mail"} description={vm.token?"Confirme para continuar com a conta vinculada a este e-mail.":"Use a confirmação recebida por e-mail para continuar. Se já confirmou, entre na mesma conta."} onBack={()=>navigate("/entrar")}>
 <FormFeedback message={vm.error||resume.error||retryVm.error}/><FormFeedback tone="info" message={vm.message}/>{reg.result?.emailDispatch&&reg.result.emailDispatch!=="accepted"&&<FormFeedback tone="info" message="Não foi possível confirmar a solicitação de envio. Você pode pedir um novo e-mail."/>}
 {vm.token&&<button className="primary-button" onClick={vm.verify} disabled={vm.busy}>{vm.busy?"Confirmando…":"Confirmar e-mail"}</button>}
 {["unknown","processing"].includes(state?.status)&&<div className="status-card"><p>Não foi possível confirmar a conclusão. Consulte a situação antes de tentar novamente.</p><button className="secondary-button" onClick={resume.check} disabled={resume.busy}>{resume.busy?"Consultando…":"Consultar situação"}</button>{reg.attempt.current&&<button className="text-button" onClick={()=>retryVm.submit(reg.attempt.current.snapshot.mode)} disabled={resume.busy||retryVm.busy}>Tentar novamente com esta tentativa</button>}</div>}
 <form className="auth-form" onSubmit={e=>{e.preventDefault();vm.resend(email);}} style={{marginTop:24}}><FormField id="confirmation-email" label="E-mail do cadastro" type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)}/><button className="secondary-button" disabled={vm.busy||wait>0}>{wait?("Reenviar em "+wait+"s"):"Solicitar reenvio"}</button></form>
 <div className="auth-actions"><button className="primary-button" onClick={()=>auth.refresh().then(s=>{if(!s.authenticated)navigate("/entrar");}).catch(()=>{})}>Continuar após confirmar</button><p className="legal-note"><AppLink to="/entrar">Entrar na minha conta</AppLink></p></div>
 </AuthLayout>;
}
