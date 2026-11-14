import { ApiError, type FieldError } from "../../presentation/http/errors/api-error.ts";
import { NOTICE_VERSION, type RegistrationInput, type Snapshot } from "./registration.ts";
export const uuid=(v:unknown):v is string=>typeof v==="string"&&/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
export const record=(v:unknown):Record<string,unknown>=>{if(!v||typeof v!=="object"||Array.isArray(v))throw new ApiError(422,"VALIDATION_ERROR","Informe os campos do formulário.");return v as Record<string,unknown>;};
export function keys(v:Record<string,unknown>,allowed:string[]){if(Object.keys(v).some(k=>!allowed.includes(k)))throw new ApiError(422,"VALIDATION_ERROR","Há campos não permitidos na solicitação.");}
export function email(v:unknown){if(typeof v!=="string"||v.trim().length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(v.trim()))throw new ApiError(422,"VALIDATION_ERROR","Revise seu e-mail.",[{field:"email",code:"EMAIL_INVALID",message:"Informe um e-mail válido."}]);return v.trim().toLowerCase();}
export function password(v:unknown){if(typeof v!=="string"||[...v].length<8||Buffer.byteLength(v,"utf8")>72)throw new ApiError(422,"VALIDATION_ERROR","Revise sua senha.",[{field:"password",code:"PASSWORD_INVALID",message:"Use ao menos 8 caracteres e no máximo 72 bytes UTF-8."}]);return v;}
export function snapshot(value:unknown,photoRequested=false):Snapshot{
 const v=record(value);const fields:FieldError[]=[];
 const name=typeof v.name==="string"?v.name.trim():"";
 if([...name].length<2||[...name].length>100)fields.push({field:"name",code:"NAME_INVALID",message:"Use entre 2 e 100 caracteres."});
 const cats=v.categoryIds;const terms=v.productInterests;
 if(!Array.isArray(cats)||cats.length>9||cats.some(x=>typeof x!=="string"||!x)||new Set(cats).size!==cats.length)fields.push({field:"categoryIds",code:"CATEGORIES_INVALID",message:"Revise as categorias escolhidas."});
 const cleaned=Array.isArray(terms)?terms.map(x=>typeof x==="string"?x.trim():""):[];
 if(!Array.isArray(terms)||terms.length>10||cleaned.some(x=>[...x].length<1||[...x].length>100)||new Set(cleaned.map(x=>x.toLowerCase())).size!==cleaned.length)fields.push({field:"productInterests",code:"TERMS_INVALID",message:"Informe até 10 termos distintos de 1 a 100 caracteres."});
 const marketing=record(v.marketing);keys(marketing,["allowed","noticeVersion"]);
 if(typeof marketing.allowed!=="boolean")fields.push({field:"marketing",code:"CHOICE_REQUIRED",message:"Informe sua escolha sobre publicidade."});
 if(fields.length)throw new ApiError(422,"VALIDATION_ERROR","Revise os campos indicados.",fields);
 if(marketing.noticeVersion!==NOTICE_VERSION)throw new ApiError(409,"NOTICE_VERSION_CHANGED","O aviso foi atualizado. Leia e confirme sua escolha novamente.");
 return {name,categoryIds:[...(cats as string[])].sort(),productInterests:cleaned,marketing:{allowed:marketing.allowed as boolean,noticeVersion:NOTICE_VERSION},photoRequested};
}
export function registration(value:unknown):RegistrationInput {
 const v=record(value);keys(v,["name","email","password","mode","photoRequested","categoryIds","productInterests","marketing"]);
 if(!["complete","skip"].includes(String(v.mode))||typeof v.photoRequested!=="boolean")throw new ApiError(422,"VALIDATION_ERROR","Revise a etapa de cadastro.");
 const s=snapshot(v,v.photoRequested);
 if(v.mode==="skip"&&(s.categoryIds.length||s.productInterests.length||s.marketing.allowed))throw new ApiError(422,"SKIP_PAYLOAD_INVALID","Pular continua sem interesses e sem publicidade.");
 return {...s,email:email(v.email),password:password(v.password),mode:v.mode as "complete"|"skip"};
}
