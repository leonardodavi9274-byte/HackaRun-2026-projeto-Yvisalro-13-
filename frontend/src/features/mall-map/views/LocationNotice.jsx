import {Icon} from "../../../shared/components/Icon.jsx";
import {formatDistance} from "../models/geolocation.js";
const FAILURE="Não foi possível encontrar a localização do dispositivo";
/** "Usar minha localização" e mensagens de resultado (contracts/ui.md, Mensagens de localização). */
export function LocationNotice({mall,location,onChooseStart}){
 const name=mall.name;
 let message=null;
 if(location.status==="requesting")message=<p>Procurando a localização do dispositivo…</p>;
 if(location.status==="inside")message=<><p><strong>Você está no {name}</strong>. Escolha onde você está para ver as lojas próximas.</p>
  <button type="button" className="text-button" onClick={onChooseStart}>Escolher ponto de partida</button></>;
 if(location.status==="outside")message=<p>Você está a aproximadamente {formatDistance(location.distanceM)} do {name}. Você pode continuar consultando o mapa normalmente.</p>;
 if(location.failed)message=<><p><strong>{FAILURE}</strong>.{location.status==="denied"?" A permissão foi negada.":""}</p>
  <div className="inline-actions">
   {location.canRetry&&<button type="button" className="text-button" onClick={location.request}>Tentar novamente</button>}
   <button type="button" className="text-button" onClick={location.chooseManually}>Escolher shopping manualmente</button>
  </div></>;
 return <section className="location-notice" aria-label="Localização do dispositivo">
  {location.status==="idle"?<>
   <button type="button" className="secondary-button location-button" onClick={location.request}><Icon name="locate" size={18}/>Usar minha localização</button>
   <p className="mall-note">Usamos sua localização só para saber se você está no shopping. Ela não é salva.</p></>:null}
  <div role="status">{message}</div>
  {location.manual==="choosing"&&<div className="manual-mall" role="group" aria-label="Escolher shopping manualmente">
   <p className="mall-meta">Shopping disponível na demonstração:</p>
   <button type="button" className="start-option" onClick={location.confirmManual}><strong>{name}</strong><span>{mall.isDemo?"Demonstração":"Shopping"}</span></button>
   <button type="button" className="text-button" onClick={location.cancelManual}>Cancelar</button>
  </div>}
  {location.manual==="confirmed"&&<p role="status" className="mall-meta">{name} selecionado.</p>}
 </section>;
}
