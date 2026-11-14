import {hasPendingConfirmation} from "../features/registration/viewmodels/useIdentityViewModel.js";
import {MarketingPreferencesView} from "../features/account-preferences/views/MarketingPreferencesView.jsx";
import {useEffect} from "react";
import {HomeView} from "../features/home/views/HomeView.jsx";
import {ProjectHomeView} from "../features/home/views/ProjectHomeView.jsx";
import {SearchHandoffView} from "../features/home/views/SearchHandoffView.jsx";
import {RegistrationProvider,useRegistration} from "../features/registration/viewmodels/RegistrationProvider.jsx";
import {useSessionViewModel} from "../features/session/viewmodels/useSessionViewModel.js";
import {AccountStepView} from "../features/registration/views/AccountStepView.jsx";
import {PreferencesStepView} from "../features/registration/views/PreferencesStepView.jsx";
import {ConfirmationView} from "../features/registration/views/ConfirmationView.jsx";
import {LoginView} from "../features/session/views/LoginView.jsx";
import {FormFeedback} from "../shared/components/FormFeedback.jsx";
import {navigate,usePath,SEARCH_PATH} from "./navigation.js";
import {AppLink} from "./Link.jsx";
import "../styles/registration.css";
function Application(){
 const path=usePath(),auth=useSessionViewModel(),reg=useRegistration();
 useEffect(()=>{const email=auth.session?.user?.email;if(email&&reg.file&&reg.fileOwner!==email){reg.setFile(null);reg.setFileOwner(null);}},[auth.session?.user?.id,reg.fileOwner,reg.file]);
 const complete=auth.session?.authenticated&&auth.session.onboarding?.status==="completed";
 const protectedRoute=["/perfil/preferencias"].includes(path);
 useEffect(()=>{
  if(auth.loading||auth.error)return;
  if(protectedRoute&&!auth.session?.authenticated){navigate("/entrar",{replace:true});return;}
  if(auth.session?.authenticated){
   if(!complete&&protectedRoute)navigate("/cadastro/confirmar",{replace:true});
   if(complete&&["/entrar","/cadastro","/cadastro/preferencias","/cadastro/confirmar"].includes(path)&&!(path==="/cadastro/confirmar"&&hasPendingConfirmation()))navigate("/inicio",{replace:true});
  }
  if(path==="/cadastro/preferencias"&&!reg.draft.name&&!reg.frozen)navigate("/cadastro",{replace:true});
 },[path,auth.loading,auth.session,auth.error,complete,reg.draft.name,reg.frozen]);
 if(path==="/")return <><nav className="account-entry-links" style={{display:"flex",justifyContent:"flex-end",gap:20,padding:"14px 32px",fontSize:13}} aria-label="Acesso à conta"><AppLink to="/inicio">Explorar vitrine</AppLink><AppLink to="/cadastro">Criar conta</AppLink><AppLink to={complete?"/inicio":"/entrar"}>{complete?"Minha conta":"Entrar"}</AppLink></nav><ProjectHomeView/></>;
 // Rotas públicas: não esperam nem dependem da consulta de sessão (FR-001).
 if(path==="/inicio")return <HomeView auth={auth.error?null:auth} onLogout={async()=>{await auth.logout();reg.clear();}}/>;
 if(path===SEARCH_PATH)return <SearchHandoffView/>;
 if(auth.loading)return <main className="auth-page"><div className="auth-shell"><p role="status">Consultando sua sessão…</p></div></main>;
 if(auth.error)return <main className="auth-page"><div className="auth-shell"><FormFeedback message={auth.error}/><button className="primary-button" onClick={()=>auth.refresh().catch(()=>{})}>Tentar novamente</button></div></main>;
 if(path==="/entrar")return <LoginView auth={auth}/>;
 if(path==="/cadastro")return <AccountStepView/>;
 if(path==="/cadastro/preferencias")return <PreferencesStepView/>;
 if(path==="/cadastro/confirmar")return <ConfirmationView auth={auth}/>;
 if(path==="/perfil/preferencias")return complete?<MarketingPreferencesView key={auth.session.user.id}/>:null;
 return <main className="auth-page"><div className="auth-shell"><h1>Página não encontrada</h1><AppLink to="/">Voltar ao início</AppLink></div></main>;
}
export function App(){return <RegistrationProvider><Application/></RegistrationProvider>;}
