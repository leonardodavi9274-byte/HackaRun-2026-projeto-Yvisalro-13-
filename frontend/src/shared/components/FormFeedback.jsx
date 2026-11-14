import {useEffect,useRef} from "react";
export function FormFeedback({message,tone="error",children}){const ref=useRef(null);useEffect(()=>{if(message&&tone==="error")ref.current?.focus();},[message,tone]);if(!message)return null;return <div ref={ref} tabIndex={-1} className={"form-feedback "+tone} role={tone==="error"?"alert":"status"}>{message}{children}</div>;}
