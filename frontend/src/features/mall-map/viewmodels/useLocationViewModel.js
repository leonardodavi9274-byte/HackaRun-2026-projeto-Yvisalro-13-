import {useEffect,useRef,useState} from "react";
import {classifyPosition} from "../models/geolocation.js";

const OPTIONS={enableHighAccuracy:false,timeout:10000,maximumAge:60000};
const ERROR_STATUS={1:"denied",2:"unavailable",3:"timeout"};

/**
 * Localização do dispositivo (FR-012–014). A permissão só é pedida pela ação
 * "Usar minha localização". As coordenadas são descartadas logo após o cálculo:
 * nada é enviado ao serviço nem guardado no navegador.
 * Estados: idle, requesting, inside, outside, denied, unavailable, timeout.
 */
export function useLocationViewModel(mall){
 const [state,setState]=useState({status:"idle"});
 const [manual,setManual]=useState("idle");
 const attempt=useRef(0);
 useEffect(()=>()=>{attempt.current++;},[]);

 function request(){
  const id=++attempt.current;
  if(!mall||typeof navigator==="undefined"||!navigator.geolocation){setState({status:"unavailable"});return;}
  setState({status:"requesting"});
  navigator.geolocation.getCurrentPosition(
   position=>{if(id===attempt.current)setState(classifyPosition(mall,position.coords.latitude,position.coords.longitude));},
   failure=>{if(id===attempt.current)setState({status:ERROR_STATUS[failure.code]??"unavailable"});},
   OPTIONS,
  );
 }

 return {
  ...state,request,
  failed:["denied","unavailable","timeout"].includes(state.status),
  canRetry:["unavailable","timeout"].includes(state.status),
  manual,chooseManually:()=>setManual("choosing"),confirmManual:()=>setManual("confirmed"),cancelManual:()=>setManual("idle"),
 };
}
