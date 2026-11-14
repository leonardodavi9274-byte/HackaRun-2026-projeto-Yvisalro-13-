import {useMarketingPreferencesViewModel} from "../viewmodels/useMarketingPreferencesViewModel.js";
import {MarketingConsentField} from "./MarketingConsentField.jsx";
import {AuthLayout} from "../../registration/views/AuthLayout.jsx";
import {FormFeedback} from "../../../shared/components/FormFeedback.jsx";
import {navigate} from "../../../app/navigation.js";
export function MarketingPreferencesView(){
 const vm=useMarketingPreferencesViewModel();return <AuthLayout step={null} title="Você escolhe o que recebe" description="Publicidade por e-mail é opcional. Alterar esta escolha não limita o acesso à sua conta." onBack={()=>navigate("/inicio")}>
 <FormFeedback message={vm.error}><button className="text-button" onClick={vm.load}>Consultar novamente</button></FormFeedback><FormFeedback tone="info" message={vm.message}/>
 {vm.loading?<p role="status">Consultando sua preferência…</p>:vm.saved&&<form className="auth-form" onSubmit={e=>{e.preventDefault();vm.save();}} aria-busy={vm.busy}><MarketingConsentField allowed={vm.draft} onChange={vm.setDraft} disabled={vm.busy}/><p className="muted">Última escolha salva: publicidade {vm.saved.allowed?"autorizada":"não autorizada"}. {vm.draft!==vm.saved.allowed?"Sua alteração ainda não foi salva.":""}</p><button className="primary-button" disabled={vm.busy||vm.draft===vm.saved.allowed}>{vm.busy?"Salvando…":"Salvar preferência"}</button><p className="muted">Interesses e alertas solicitados são escolhas separadas. Este controle não cria pedidos de aviso.</p></form>}
 </AuthLayout>;
}
