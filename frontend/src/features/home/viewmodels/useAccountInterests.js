import {useEffect,useState} from "react";
import {registrationRepository} from "../../registration/repositories/registration.repository.js";
// Interesses da conta usados só para ordenar promoções próximas (feature 008).
// Opcional: sem sessão ou com falha, a tela pública segue sem personalização.
export function useAccountInterests({ownerId,onUnauthorized}){
 const [state,setState]=useState({ownerId:null,categoryIds:[],ready:false});
 useEffect(()=>{
  if(!ownerId){setState({ownerId:null,categoryIds:[],ready:false});return;}
  let live=true;
  setState({ownerId,categoryIds:[],ready:false});
  registrationRepository.profile()
   .then(profile=>{if(live)setState({ownerId,categoryIds:profile?.interests?.categoryIds??[],ready:true});})
   .catch(error=>{if(!live)return;setState({ownerId,categoryIds:[],ready:true});if(error?.status===401)onUnauthorized?.();});
  return()=>{live=false;};
 },[ownerId]);
 return state.ownerId===ownerId?state:{ownerId,categoryIds:[],ready:false};
}
