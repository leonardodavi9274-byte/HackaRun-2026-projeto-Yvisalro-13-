import {Icon} from "../../../shared/components/Icon.jsx";
import {ZOOM_MAX,ZOOM_MIN} from "../viewmodels/useMallMapViewModel.js";
export function ZoomControls({zoom,onZoom}){
 return <div className="zoom-controls" role="group" aria-label="Aproximação do mapa">
  <button type="button" aria-label="Aproximar mapa" disabled={zoom>=ZOOM_MAX} onClick={()=>onZoom(1.5)}><Icon name="plus" size={20}/></button>
  <button type="button" aria-label="Afastar mapa" disabled={zoom<=ZOOM_MIN} onClick={()=>onZoom(1/1.5)}><Icon name="minus" size={20}/></button>
 </div>;
}
