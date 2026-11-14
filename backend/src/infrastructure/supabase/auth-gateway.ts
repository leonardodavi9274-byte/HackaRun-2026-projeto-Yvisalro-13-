import {createClient,type Session,type User} from "@supabase/supabase-js";
import {env} from "../../config/env.ts";
import {getSupabaseClient} from "./client.ts";
import {ApiError} from "../../presentation/http/errors/api-error.ts";
import type {AuthGateway} from "../../application/ports/auth-gateway.ts";
const identity=(user:User)=>({id:user.id,email:user.email??"",confirmed:Boolean(user.email_confirmed_at)});
function client(){
 if(!env.supabaseUrl||!env.supabasePublishableKey)throw new ApiError(503,"AUTH_NOT_CONFIGURED","A autenticação ainda não foi configurada.");
 let retryAfter=env.resendInterval;
 const sdk=createClient(env.supabaseUrl,env.supabasePublishableKey,{
 auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false},
 global:{fetch:async(input,init)=>{const response=await fetch(input,{...init,signal:AbortSignal.any([AbortSignal.timeout(10000),...(init?.signal?[init.signal]:[])])});const header=response.headers.get("Retry-After");if(header){const seconds=Number(header);const delay=Number.isFinite(seconds)?seconds:Math.ceil((Date.parse(header)-Date.now())/1000);if(Number.isFinite(delay))retryAfter=Math.max(retryAfter,delay);}return response;}}
 });
 return {auth:sdk.auth,retryAfter:()=>retryAfter};
}
function failure(error:{status?:number;code?:string}|null,login=false,retryAfter=env.resendInterval):never{
 if(error?.status===429)throw new ApiError(429,"AUTH_RATE_LIMITED","Aguarde antes de tentar novamente.",undefined,retryAfter);
 if(error?.code==="email_not_confirmed"&&!login)throw new ApiError(403,"EMAIL_CONFIRMATION_REQUIRED","Confirme seu e-mail para continuar.");
 if(login&&error?.status&&error.status<500)throw new ApiError(401,"INVALID_CREDENTIALS","Não foi possível entrar com esses dados.");
 throw new ApiError(503,"AUTH_SERVICE_UNAVAILABLE","O serviço de identidade está indisponível.");
}
export class SupabaseAuthGateway implements AuthGateway {
 async signup(email:string,password:string,metadata:Record<string,string>){
  const c=client();const {data,error}=await c.auth.signUp({email,password,options:{data:metadata}});
  if(error){if(!error.status||error.status>=500)failure(error);return {session:null,accepted:false,failedCode:error.status===429?"AUTH_RATE_LIMITED":"REGISTRATION_NOT_COMPLETED",retryAfter:c.retryAfter()};}
  return {session:data.session,accepted:true,failedCode:null};
 }
 async login(email:string,password:string){const c=client();const {data,error}=await c.auth.signInWithPassword({email,password});if(error||!data.session)failure(error,true,c.retryAfter());return data.session!;}
 async verify(tokenHash:string){const c=client();const {data,error}=await c.auth.verifyOtp({token_hash:tokenHash,type:"email"});if(error||!data.session){if(error?.status===429)failure(error,false,c.retryAfter());if(!error?.status||error.status>=500)failure(error);throw new ApiError(422,"CONFIRMATION_INVALID","A confirmação não é válida ou expirou. Entre ou solicite outro e-mail.");}return data.session!;}
 async resend(email:string){const c=client();const {error}=await c.auth.resend({type:"signup",email});if(error){if(error.status===429)failure(error,false,c.retryAfter());throw new ApiError(503,"EMAIL_SERVICE_UNAVAILABLE","Não foi possível confirmar a solicitação de reenvio.");}}
 async user(token:string){const {data,error}=await client().auth.getUser(token);if(error||!data.user){if(!error?.status||error.status>=500)failure(error);throw new ApiError(401,"INVALID_SESSION","Entre na sua conta para continuar.");}return identity(data.user!);}
 async identity(id:string){const admin=getSupabaseClient();if(!admin)failure(null);const {data,error}=await admin!.auth.admin.getUserById(id);if(error||!data.user)failure(error);return identity(data.user!);}
 async refresh(refreshToken:string):Promise<Session>{const c=client();const {data,error}=await c.auth.refreshSession({refresh_token:refreshToken});if(error||!data.session)failure(error,true);return data.session!;}
 async logout(token:string){const admin=getSupabaseClient();if(!admin)return;await admin.auth.admin.signOut(token,"local");}
}
