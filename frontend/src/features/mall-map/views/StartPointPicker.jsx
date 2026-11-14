import {useEffect,useId,useRef} from "react";
import {FormFeedback} from "../../../shared/components/FormFeedback.jsx";
const KIND_LABEL={entrance:"Entrada",escalator:"Escada rolante",stairs:"Escada",elevator:"Elevador",landmark:"Referência"};
/** "Onde você está?": pontos conhecidos por piso. Os mesmos pontos ficam clicáveis no mapa. */
export function StartPointPicker({index,destination,currentPointId,error,onChoose,onCancel}){
 const titleId=useId(),title=useRef(null);
 useEffect(()=>{title.current?.focus();},[]);
 return <section className="mall-sheet" aria-labelledby={titleId}>
  <h2 id={titleId} ref={title} tabIndex={-1}>Onde você está?</h2>
  <p className="mall-meta">{destination?`Escolha o ponto de partida para chegar à ${destination.name}. `:""}Escolha um ponto conhecido do shopping, aqui ou no mapa. A localização do dispositivo não define sua posição aqui dentro.</p>
  <FormFeedback message={error}/>
  {index.floors.map(floor=><div key={floor.id} className="start-group">
   <h3>{floor.name}</h3>
   <ul>{floor.points.map(point=><li key={point.id}>
    <button type="button" className="start-option" aria-pressed={point.id===currentPointId} onClick={()=>onChoose(point.id)}>
     <strong>{point.label}</strong><span>{KIND_LABEL[point.kind]}{point.id===currentPointId?" · ponto atual":""}</span>
    </button></li>)}</ul>
  </div>)}
  <button type="button" className="secondary-button mall-full" onClick={onCancel}>Cancelar</button>
 </section>;
}
