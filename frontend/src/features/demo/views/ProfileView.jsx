import {navigate} from "../../../app/navigation.js";
import {Icon} from "../../../shared/components/Icon.jsx";
import {CategoryGrid} from "../../registration/views/CategoryGrid.jsx";
import {CATEGORIES} from "../data/catalog.js";
import {useDemoStore} from "../viewmodels/DemoStore.jsx";
import {DemoNotice, DemoPage} from "./DemoChrome.jsx";
import {Initials} from "./ProductGlyph.jsx";

/** Perfil (aba do protótipo sem imagem própria): interesses, e-mails e saída da conta. */
export function ProfileView() {
  const store = useDemoStore(), account = store.account;
  return <DemoPage current="/perfil" className="demo-profile">
    <header className="demo-profile-head"><Initials name={account.name} size={72} photo={account.photo} />
      <div><h1>{account.name}</h1><p>{account.email}</p></div></header>
    <section className="demo-section"><div className="demo-section-head"><h2>Seus interesses</h2></div>
      <CategoryGrid categories={CATEGORIES} selected={account.categoryIds} onChange={ids => store.updatePreferences({categoryIds: ids})} />
      {account.productInterests.length > 0 && <div className="interest-chips">{account.productInterests.map(t => <span className="interest-chip" key={t}>{t}
        <button type="button" aria-label={`Remover ${t}`} onClick={() => store.updatePreferences({productInterests: account.productInterests.filter(x => x !== t)})}>×</button></span>)}</div>}
    </section>
    <section className="demo-section">
      <label className="consent-card"><span className="consent-copy"><strong>Receber ofertas por e-mail</strong><span>Avisos de queda de preço e de volta ao estoque da sua lista. Você pode desligar a qualquer momento.</span></span>
        <span className="consent-switch"><input type="checkbox" role="switch" checked={account.marketing} onChange={e => store.updatePreferences({marketing: e.target.checked})} /><span className="consent-track" /></span></label>
    </section>
    <section className="demo-section demo-profile-actions">
      <button type="button" className="secondary-button" onClick={() => { store.logout(); navigate("/entrar"); }}><Icon name="logout" size={20} />Sair</button>
      <button type="button" className="secondary-button" onClick={() => { if (confirm("Apagar contas, desejos e buscas da demonstração neste navegador?")) { store.resetDemo(); navigate("/entrar"); } }}>
        <Icon name="refresh" size={20} />Restaurar dados de demonstração</button>
    </section>
    <DemoNotice />
  </DemoPage>;
}
