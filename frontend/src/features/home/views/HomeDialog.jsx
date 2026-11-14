import {useEffect,useRef} from "react";
// <dialog> nativo em modo modal: foco contido, Escape fecha (evento cancel) e o foco
// volta ao elemento que abriu o diálogo.
export function HomeDialog({titleId,returnFocus,onClose,className="",children}){
 const ref=useRef(null);
 useEffect(()=>{
  const dialog=ref.current,opener=returnFocus;
  if(dialog&&!dialog.open)dialog.showModal();
  return()=>{if(dialog?.open)dialog.close();if(opener?.isConnected)opener.focus();};
 },[returnFocus]);
 return <dialog ref={ref} className={"home-dialog "+className} aria-labelledby={titleId}
  onCancel={e=>{e.preventDefault();onClose();}}
  onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
  <div className="home-dialog-body">
   <button type="button" className="home-dialog-close" onClick={onClose}>Fechar</button>
   {children}
  </div>
 </dialog>;
}
