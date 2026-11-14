import {AppLink} from "../../../app/Link.jsx";
// Saudação neutra: o conteúdo público não presume conta, nome ou personalização.
export function HomeHeader({shopping,authenticated,onLogout,loggingOut}){
 return <>
  <a className="skip-link" href="#home-content">Ir para o conteúdo</a>
  <header className="home-header">
   <div className="home-header-place">
    <AppLink to="/" className="home-brand">Hackarum<span>Yvisalro</span></AppLink>
    {shopping&&<p className="home-shopping">{shopping.name}{shopping.isDemo&&<span className="demo-badge">Demonstração</span>}</p>}
   </div>
   <nav className="home-account" aria-label="Acesso à conta">
    {authenticated
     ?<><AppLink to="/perfil/preferencias">Preferências</AppLink><button type="button" className="home-link-button" onClick={onLogout} disabled={loggingOut}>{loggingOut?"Saindo…":"Sair"}</button></>
     :<><AppLink to="/entrar">Entrar</AppLink><AppLink to="/cadastro" className="home-account-primary">Criar conta</AppLink></>}
   </nav>
  </header>
 </>;
}
