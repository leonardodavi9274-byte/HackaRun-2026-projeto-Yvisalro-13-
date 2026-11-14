import {createContext,useContext,useMemo,useState} from "react";
/**
 * Estado global da rota ativa (FR-011, research D7), somente em memória: recarregar ou
 * fechar o aplicativo encerra a rota.
 *
 * Integração com outras telas:
 * - Ofertas de proximidade (tela 11, futura) devem consultar `useActiveRoute().isActive`
 *   e não ser exibidas enquanto for verdadeiro, independentemente de onde a rota começou.
 * - As ações "Me leve lá" e "Me leve até a loja" (telas 05, 06, 07 e 11, futuras) navegam
 *   para `/mapa?loja={storeId}`; o mapa seleciona a loja e segue para "Onde você está?".
 * Nenhuma oferta de proximidade é implementada na feature 005.
 */
const Context=createContext(null);
export function ActiveRouteProvider({children}){
 const [route,setRoute]=useState(null);
 const [startPointId,setStartPointId]=useState(null);
 const [promotionPoint,setPromotionPoint]=useState(null);
 const value=useMemo(()=>({
  route,startPointId,promotionPoint,
  setStartPointId:(id,context)=>{setStartPointId(id);setPromotionPoint(id&&context?{pointId:id,...context}:null);},
  clearPromotionPoint:()=>setPromotionPoint(null),
  /** Verdadeiro em "ativa" e "chegou", até a pessoa encerrar. */
  isActive:Boolean(route),
  destinationStoreId:route?.storeId??null,
  start:next=>setRoute({...next,stepIndex:0,arrived:false}),
  replace:next=>setRoute({...next,stepIndex:0,arrived:false}),
  end:()=>setRoute(null),
  next:()=>setRoute(r=>!r||r.arrived?r:r.stepIndex<r.instructions.length-1?{...r,stepIndex:r.stepIndex+1}:{...r,arrived:true}),
  previous:()=>setRoute(r=>!r?r:r.arrived?{...r,arrived:false}:{...r,stepIndex:Math.max(0,r.stepIndex-1)}),
 }),[route,startPointId,promotionPoint]);
 return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useActiveRoute(){
 const value=useContext(Context);
 if(!value)throw new Error("useActiveRoute precisa de ActiveRouteProvider.");
 return value;
}
/** A publicidade trata a ausência do provedor como estado desconhecido, nunca como inativo. */
export function useOptionalActiveRoute(){return useContext(Context);}
