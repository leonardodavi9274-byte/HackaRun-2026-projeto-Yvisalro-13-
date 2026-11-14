import {createCipheriv,createDecipheriv,createHash,createHmac,hkdfSync,randomBytes} from "node:crypto";
import {env} from "../../config/env.ts";
import {ApiError} from "../../presentation/http/errors/api-error.ts";
function key(context:string){if(!env.securityKey)throw new ApiError(503,"AUTH_NOT_CONFIGURED","A sessão ainda não foi configurada.");return Buffer.from(hkdfSync("sha256",Buffer.from(env.securityKey,"base64"),Buffer.alloc(0),context,32));}
export const digest=(v:string|Buffer)=>createHash("sha256").update(v).digest("hex");
export const randomSecret=()=>randomBytes(32).toString("base64url");
export const bindingProof=(id:string,email:string)=>createHmac("sha256",key("registration-binding-v1")).update(JSON.stringify([id,email])).digest("base64url");
export function encrypt(tokens:{access_token:string;refresh_token:string}){
 const nonce=randomBytes(12);const cipher=createCipheriv("aes-256-gcm",key("session-encryption-v1"),nonce);cipher.setAAD(Buffer.from("hy-session-v1"));
 const bytes=Buffer.concat([cipher.update(JSON.stringify(tokens),"utf8"),cipher.final()]);
 return "\\x"+Buffer.concat([nonce,cipher.getAuthTag(),bytes]).toString("hex");
}
export function decrypt(v:string):{access_token:string;refresh_token:string}{
 try{const bytes=Buffer.from(v.startsWith("\\x")?v.slice(2):v,"hex");const decipher=createDecipheriv("aes-256-gcm",key("session-encryption-v1"),bytes.subarray(0,12));decipher.setAAD(Buffer.from("hy-session-v1"));decipher.setAuthTag(bytes.subarray(12,28));const result=JSON.parse(Buffer.concat([decipher.update(bytes.subarray(28)),decipher.final()]).toString("utf8"));if(typeof result.access_token!=="string"||typeof result.refresh_token!=="string")throw new Error();return result;}catch{throw new ApiError(401,"INVALID_SESSION","Entre novamente para continuar.");}
}
