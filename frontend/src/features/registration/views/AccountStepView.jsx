import {useState} from "react";
import {useRegistrationViewModel} from "../viewmodels/useRegistrationViewModel.js";
import {passwordLabel} from "../models/registration.js";
import {FormField} from "../../../shared/components/FormField.jsx";
import {FormFeedback} from "../../../shared/components/FormFeedback.jsx";
import {AuthLayout} from "./AuthLayout.jsx";
import {navigate} from "../../../app/navigation.js";
import {AppLink} from "../../../app/Link.jsx";
export function AccountStepView(){
 const vm=useRegistrationViewModel();const [visible,setVisible]=useState(false);const d=vm.draft;const strength=passwordLabel(d.password);
 function back(){if(vm.frozen){navigate("/cadastro/confirmar");return;}if((d.name||d.email||d.password)&&!confirm("Descartar os dados deste cadastro? Cancelar mantém o formulário."))return;vm.clear();navigate("/entrar");}
 return <AuthLayout step={1} title="Crie sua conta" description="Encontre o produto, o melhor preço e o caminho até a loja." onBack={back}>
 <FormFeedback message={vm.configError?.message}><button type="button" className="text-button" onClick={()=>vm.loadConfig()}>Tentar novamente</button></FormFeedback>
 <FormFeedback message={vm.error?.message}/>
 <form className="auth-form" onSubmit={e=>{e.preventDefault();vm.next();}} noValidate aria-busy={vm.configLoading}>
 <FormField id="name" label="Nome" error={vm.fields.name}><input id="name" name="name" autoComplete="name" value={d.name} onChange={e=>vm.patch({name:e.target.value})} placeholder="Seu nome" aria-invalid={Boolean(vm.fields.name)} aria-describedby={vm.fields.name?"name-error":undefined} disabled={vm.frozen}/></FormField>
 <FormField id="email" label="E-mail de login" error={vm.fields.email}><input id="email" type="email" name="email" autoComplete="email" inputMode="email" value={d.email} onChange={e=>vm.patch({email:e.target.value})} placeholder="voce@email.com" aria-invalid={Boolean(vm.fields.email)} aria-describedby={vm.fields.email?"email-error":undefined} disabled={vm.frozen}/></FormField>
 <FormField id="password" label="Senha" error={vm.fields.password}><div className="password-wrap"><input id="password" type={visible?"text":"password"} name="password" autoComplete="new-password" spellCheck={false} value={d.password} onChange={e=>vm.patch({password:e.target.value})} aria-invalid={Boolean(vm.fields.password)} aria-describedby={vm.fields.password?"password-error password-rules":"password-rules"} disabled={vm.frozen}/><button type="button" className="eye-button" onClick={()=>setVisible(v=>!v)} aria-label={visible?"Ocultar senha":"Mostrar senha"} aria-pressed={visible}><svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg></button></div>
 <div className="password-meter" aria-hidden="true">{[0,1,2,3].map(n=><span key={n} className={d.password&&(strength==="Forte"?n<4:strength==="Válida"?n<2:n===0)?"active":""}/>)}</div>
 {d.password&&<span className="password-caption" role="status">Senha: {strength.toLowerCase()}</span>}<small id="password-rules">Ao menos 8 caracteres e até 72 bytes UTF-8. Acentos e emoji podem ocupar vários bytes.</small></FormField>
 <div className="auth-actions"><button type="submit" className="primary-button" disabled={vm.configLoading||!vm.config||vm.frozen}>{vm.configLoading?"Carregando…":"Continuar"}</button><p className="legal-note">Ao continuar você aceita os {vm.config?<><a href={vm.config.legal.termsUrl} target="_blank" rel="noreferrer">Termos</a> e a <a href={vm.config.legal.privacyUrl} target="_blank" rel="noreferrer">Política de Privacidade</a></>:<>Termos e a Política de Privacidade, disponíveis quando o cadastro for liberado</>}.</p><p className="legal-note">Já tem uma conta? <AppLink to="/entrar">Entrar</AppLink></p></div>
 </form>{vm.frozen&&<AppLink to="/cadastro/confirmar">Consultar situação do cadastro</AppLink>}</AuthLayout>;
}
