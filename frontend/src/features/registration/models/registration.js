export const emptyDraft=()=>({name:"",email:"",password:"",categoryIds:[],productInterests:[],marketing:{allowed:false,noticeVersion:"marketing-email-v1"},photoRequested:false});
export const count=value=>[...value].length;
export function validateAccount(v){
 const fields={};if(count(v.name.trim())<2||count(v.name.trim())>100)fields.name="Informe seu nome com 2 a 100 caracteres.";
 if(v.email.trim().length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(v.email.trim()))fields.email="Informe um e-mail válido.";
 const bytes=new TextEncoder().encode(v.password).length;if(count(v.password)<8||bytes>72)fields.password="Use ao menos 8 caracteres e no máximo 72 bytes UTF-8.";
 return fields;
}
export function passwordLabel(value){if(count(value)<8)return "Abaixo do mínimo";if(new TextEncoder().encode(value).length>72)return "Acima do limite";return count(value)>=12&&/\p{L}/u.test(value)&&/\p{N}/u.test(value)&&/[^\p{L}\p{N}\s]/u.test(value)?"Forte":"Válida";}
export const errorFields=e=>Object.fromEntries((e?.fields||[]).map(f=>[f.field,f.message]));
