import {useEffect} from "react";
import {navigate, usePath} from "../../app/navigation.js";
import {AppLink} from "../../app/Link.jsx";
import {LandingView} from "../landing/views/LandingView.jsx";
import {MallMapView} from "../mall-map/views/MallMapView.jsx";
import {useDemoStore} from "./viewmodels/DemoStore.jsx";
import {DemoLoginView, DemoPreferencesView, DemoRecoveryView, DemoSignupView} from "./views/DemoAuthViews.jsx";
import {DemoHomeView} from "./views/DemoHomeView.jsx";
import {SearchView} from "./views/SearchView.jsx";
import {StoryView} from "./views/StoryView.jsx";
import {WishesView} from "./views/WishesView.jsx";
import {ProfileView} from "./views/ProfileView.jsx";
import "../../styles/registration.css";
import "../../styles/mall-map.css";
import "../../styles/demo.css";

const PRIVATE = ["/inicio", "/buscar", "/stories", "/desejos", "/perfil"];
const GUEST_ONLY = ["/entrar", "/cadastro", "/cadastro/preferencias", "/recuperar-senha"];

/** Rotas das 11 telas do protótipo com o catálogo fictício (modo demonstração). */
export function DemoApplication() {
  const path = usePath(), {account} = useDemoStore();
  const isPrivate = PRIVATE.includes(path);

  useEffect(() => {
    // A raiz não é uma das telas do protótipo: abre direto o login (ou o Início, com sessão).
    if (path === "/") { navigate(account ? "/inicio" : "/entrar", {replace: true}); return; }
    if (isPrivate && !account) navigate("/entrar", {replace: true});
    if (account && GUEST_ONLY.includes(path) && path !== "/cadastro/preferencias") navigate("/inicio", {replace: true});
  }, [path, account, isPrivate]);

  if (path === "/") return null;
  // Landing page (consumidores e lojistas).
  if (path === "/sobre") return <LandingView />;
  if (path === "/mapa") return <MallMapView ownerId={account ? "demo:" + account.email : null} />;
  if (path === "/entrar") return <DemoLoginView />;
  if (path === "/cadastro") return <DemoSignupView />;
  if (path === "/cadastro/preferencias") return <DemoPreferencesView />;
  if (path === "/recuperar-senha") return <DemoRecoveryView />;
  if (isPrivate && !account) return null;
  if (path === "/inicio") return <DemoHomeView />;
  if (path === "/buscar") return <SearchView />;
  if (path === "/stories") return <StoryView />;
  if (path === "/desejos") return <WishesView />;
  if (path === "/perfil") return <ProfileView />;
  return <main className="auth-page"><div className="auth-shell"><h1>Página não encontrada</h1><AppLink to={account ? "/inicio" : "/entrar"}>Voltar ao início</AppLink></div></main>;
}
