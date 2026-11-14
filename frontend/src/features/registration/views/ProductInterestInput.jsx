import {useId,useState} from "react";
import {termError} from "../models/interests.js";
import {FormField} from "../../../shared/components/FormField.jsx";
export function ProductInterestInput({terms,onChange,disabled=false,serverError}){
 const [value,setValue]=useState(""),[error,setError]=useState(null);const id=useId();
 function add(){const issue=termError(value,terms);setError(issue);if(!issue){onChange([...terms,value.trim()]);setValue("");}}
 return <div><FormField id={id} label="Produtos que você deseja" error={error||serverError}><div className="term-row"><div className="term-input"><input id={id} value={value} disabled={disabled} placeholder="Ex.: fone bluetooth, tênis de corrida" onChange={e=>{setValue(e.target.value);setError(null);}} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();add();}}} aria-invalid={Boolean(error||serverError)} aria-describedby={error||serverError?id+"-error":undefined}/></div><button className="secondary-button" type="button" onClick={add} disabled={disabled}>Adicionar</button></div></FormField><div className="interest-chips">{terms.map(term=><span className="interest-chip" key={term}><span>{term}</span><button type="button" aria-label={"Remover "+term} onClick={()=>onChange(terms.filter(t=>t!==term))} disabled={disabled}>×</button></span>)}</div><p className="muted">{terms.length}/10 interesses. Esses termos não criam desejos ou alertas.</p></div>;
}
