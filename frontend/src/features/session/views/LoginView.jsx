import {useState} from "react";
import {AuthLayout} from "../../registration/views/AuthLayout.jsx";
import {FormField} from "../../../shared/components/FormField.jsx";
import {FormFeedback} from "../../../shared/components/FormFeedback.jsx";
import {useRegistration} from "../../registration/viewmodels/RegistrationProvider.jsx";
import {AppLink} from "../../../app/Link.jsx";
import {navigate} from "../../../app/navigation.js";
export function LoginView({auth}){
 const reg=useRegistration();const [email,setEmail]=useState(reg.draft.email);const [password,setPassword]=useState("");const [error,setError]=useState(null);const [busy,setBusy]=useState(false);const [visible,setVisible]=useState(false);
 async function submit(e){e.preventDefault();if(busy)return;setBusy(true);setError(null);try{const result=await auth.login({email,password});setPassword("");navigate(result.onboarding?.status==="completed"?"/inicio":"/cadastro/confirmar");}catch(err){setError(err);}finally{setBusy(false);}}
 return <AuthLayout step={1} title="Bem-vindo de volta" description="Entre para encontrar sua conta e continuar de onde parou." onBack={()=>navigate("/")}><FormFeedback message={error?.message}/><form className="auth-form" onSubmit={submit} aria-busy={busy}><FormField id="login-email" label="E-mail" autoComplete="email" type="email" required value={email} onChange={e=>setEmail(e.target.value)}/><FormField id="login-password" label="Senha"><div className="password-wrap"><input id="login-password" autoComplete="current-password" type={visible?"text":"password"} required value={password} onChange={e=>setPassword(e.target.value)}/><button className="eye-button" type="button" aria-label={visible?"Ocultar senha":"Mostrar senha"} onClick={()=>setVisible(v=>!v)}>◉</button></div></FormField><button className="primary-button" disabled={busy}>{busy?"Entrando…":"Entrar"}</button></form>
 {error?.code==="EMAIL_CONFIRMATION_REQUIRED"&&<button className="text-button" onClick={()=>{reg.setDraft(d=>({...d,email}));navigate("/cadastro/confirmar");}}>Confirmar ou reenviar e-mail</button>}<div className="auth-actions"><p className="legal-note">Ainda não tem conta? <AppLink to="/cadastro">Criar conta</AppLink></p><p className="legal-note">Recuperação de senha ainda não disponível nesta versão.</p></div></AuthLayout>;
}
