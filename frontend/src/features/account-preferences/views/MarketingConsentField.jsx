export const MARKETING_NOTICE="Quero receber publicidade e ofertas por e-mail. Opcional; você pode alterar essa escolha nas preferências da conta.";
export function MarketingConsentField({allowed,onChange,disabled=false}){
 return <label className="consent-card"><span className="consent-copy"><strong>Receber ofertas por e-mail?</strong><span>{MARKETING_NOTICE}</span></span><span className="consent-switch"><input type="checkbox" checked={allowed} onChange={e=>onChange(e.target.checked)} disabled={disabled} aria-label="Receber publicidade e ofertas por e-mail"/><span className="consent-track" aria-hidden="true"/></span></label>;
}
