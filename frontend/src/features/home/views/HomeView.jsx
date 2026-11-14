import {ConfirmedAvatar} from "./ConfirmedAvatar.jsx";
import {useAccountHomeViewModel} from "../viewmodels/useHomeViewModel.js";
import {FormFeedback} from "../../../shared/components/FormFeedback.jsx";
import {AppLink} from "../../../app/Link.jsx";
import {navigate} from "../../../app/navigation.js";
import {useRegistration} from "../../registration/viewmodels/RegistrationProvider.jsx";
import {BottomNav} from "../../../shared/components/BottomNav.jsx";
import "../../../styles/mall-map.css";
export function HomeView({auth}){
 const {profile,categories,accountError,categoryError,reloadAccount}=useAccountHomeViewModel();const reg=useRegistration();
 return <main className="account-shell"><header className="account-header"><AppLink to="/inicio" className="account-brand">Hackarum<span> · </span>Yvisalro</AppLink><nav aria-label="Conta"><AppLink to="/perfil/preferencias">Preferências da conta</AppLink><button className="text-button" onClick={async()=>{await auth.logout();reg.clear();navigate("/entrar");}}>Sair</button></nav></header>
 <FormFeedback message={accountError}><button className="text-button" onClick={reloadAccount}>Tentar novamente</button></FormFeedback>
 {!profile&&!accountError&&<p role="status">Carregando sua conta…</p>}
 {profile&&<><section className="account-greeting">{profile.photo.present&&<ConfirmedAvatar key={profile.id} name={profile.name}/>}<p className="eyebrow">SUA VITRINE COMEÇA AQUI</p><h1>Olá, {profile.name.split(" ")[0]}.</h1><p>Sua conta está pronta. Explore as categorias e escolha o que combina com você.</p></section>
 <section className="account-section"><h2>Explore as categorias</h2><FormFeedback message={categoryError}><button className="text-button" onClick={reloadAccount}>Carregar categorias</button></FormFeedback><div className="account-categories">{categories.map(c=><span className="category-label" key={c.id}>{c.label}</span>)}</div>{!categories.length&&!categoryError&&<p className="muted">Nenhuma categoria disponível no momento.</p>}</section>
 <section className="account-section"><h2>Seus interesses</h2><div className="account-categories">{profile.interests.productInterests.map(t=><span className="category-label" key={t}>{t}</span>)}</div><p className="muted">{profile.interests.categoryIds.length+" categorias selecionadas."} {!profile.interests.categoryIds.length&&!profile.interests.productInterests.length&&"Você continuou sem personalização."}</p></section>
 <p className="account-empty">Sua conta e suas preferências já têm um lugar aqui. O catálogo de produtos e as recomendações fazem parte das próximas etapas do projeto.</p></>}<BottomNav current="/inicio"/></main>;
}
