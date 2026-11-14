import {useEffect,useRef,useState} from "react";
export function FormFeedback({message,tone="error",children}){
 const ref=useRef(null);const text=typeof message==="string"?message:message?.message;const delay=typeof message==="object"?message?.retryAfterSeconds:0;const [remaining,setRemaining]=useState(0);
 useEffect(()=>{if(text&&tone==="error")ref.current?.focus();},[message,tone]);
 useEffect(()=>{setRemaining(delay||0);if(!delay)return;const end=Date.now()+delay*1000;const timer=setInterval(()=>{const left=Math.max(0,Math.ceil((end-Date.now())/1000));setRemaining(left);if(!left)clearInterval(timer);},1000);return()=>clearInterval(timer);},[delay,message]);
 if(!text)return null;return <div ref={ref} tabIndex={-1} className={"form-feedback "+tone} role={tone==="error"?"alert":"status"}>{text}{remaining>0&&<p>Você pode tentar novamente em {remaining} segundos.</p>}{children}</div>;
}
