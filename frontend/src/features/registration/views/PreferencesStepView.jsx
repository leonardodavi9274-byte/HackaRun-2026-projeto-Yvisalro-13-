import {MarketingConsentField} from "../../account-preferences/views/MarketingConsentField.jsx";
import {useRegistrationViewModel} from "../viewmodels/useRegistrationViewModel.js";
import {useInterestsViewModel} from "../viewmodels/useInterestsViewModel.js";
import {CategoryGrid} from "./CategoryGrid.jsx";
import {ProductInterestInput} from "./ProductInterestInput.jsx";
import {FormFeedback} from "../../../shared/components/FormFeedback.jsx";
import {AuthLayout} from "./AuthLayout.jsx";
import {navigate} from "../../../app/navigation.js";
import {AppLink} from "../../../app/Link.jsx";
export function PreferencesStepView(){
 const vm=useRegistrationViewModel(),interests=useInterestsViewModel(),disabled=vm.busy||vm.frozen;
 return <AuthLayout backDisabled={vm.busy} title="Do que você gosta?" description="Escolha categorias para personalizar sua experiência. Você também pode pular." onBack={()=>{if(!vm.busy)navigate("/cadastro");}}><FormFeedback message={vm.error}/><form className="auth-form" aria-busy={vm.busy} onSubmit={e=>{e.preventDefault();vm.submit("complete");}}>
 <CategoryGrid {...interests} selected={vm.draft.categoryIds} onChange={categoryIds=>vm.patch({categoryIds})} onRetry={()=>interests.reload()} disabled={disabled}/>{vm.fields.categoryIds&&<p className="field-error" role="alert">{vm.fields.categoryIds}</p>}
 <ProductInterestInput terms={vm.draft.productInterests} onChange={productInterests=>vm.patch({productInterests})} disabled={disabled} serverError={vm.fields.productInterests}/>
 <MarketingConsentField allowed={vm.draft.marketing.allowed} onChange={allowed=>vm.patch({marketing:{...vm.draft.marketing,allowed}})} disabled={disabled}/><div className="auth-actions"><button type="submit" className="primary-button" disabled={disabled}>{vm.busy?<><span className="spinner" aria-hidden="true"/>Criando conta…</>:"Concluir cadastro"}</button><button type="button" className="text-button" disabled={disabled} onClick={()=>vm.submit("skip")}>Pular</button><p className="legal-note">Pular continua sem interesses e sem publicidade por e-mail.</p></div></form>{vm.frozen&&!vm.busy&&<AppLink to="/cadastro/confirmar">Consultar situação do cadastro</AppLink>}</AuthLayout>;
}
