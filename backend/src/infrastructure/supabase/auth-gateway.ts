import {createClient,type Session,type User} from "@supabase/supabase-js";
import {env} from "../../config/env.ts";
import {getSupabaseClient} from "./client.ts";
import {ApiError} from "../../presentation/http/errors/api-error.ts";
import type {AuthGateway} from "../../application/ports/auth-gateway.ts";
const identity=(user:User)=>({id:user.id,email:user.email??"",confirmed:Boolean(user.email_confirmed_at)});
function client(){
 if(!env.supabaseUrl||!env.supabasePublishableKey)throw new ApiError(503,"AUTH_NOT_CONFIGURED","A autenticação ainda não foi configurada.");
 return createClient(env.supabaseUrl,env.supabasePublishableKey,{
 auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false},
 global:{fetch:(input,init)=>fetch(input,{...init,signal:AbortSignal.any([AbortSignal.timeout(10000),...(init?.signal?[init.signal]:[])])})}
 });
}
function failure(error:{status?:number;code?:string}|null,login=false):never{
 if(error?.status===429)throw new ApiError(429,"AUTH_RATE_LIMITED","Aguarde antes de tentar novamente.",undefined,env.resendInterval);
 if(error?.code==="email_not_confirmed")throw new ApiError(403,"EMAIL_CONFIRMATION_REQUIRED","Confirme seu e-mail para continuar.");
 if(login&&error?.status&&error.status<500)throw new ApiError(401,"INVALID_CREDENTIALS","Não foi possível entrar com esses dados.");
 throw new ApiError(503,"AUTH_SERVICE_UNAVAILABLE","O serviço de identidade está indisponível.");
}
export class SupabaseAuthGateway implements AuthGateway {
 async signup(email:string,password:string,metadata:Record<string,string>){
  const {data,error}=await client().auth.signUp({email,password,options:{data:metadata}});
  if(error){if(!error.status||error.status>=500)failure(error);return {session:null,accepted:false,failedCode:error.status===429?"AUTH_RATE_LIMITED":"REGISTRATION_NOT_COMPLETED"};}
  return {session:data.session,accepted:true,failedCode:null};
 }
 async login(email:string,password:string){const {data,error}=await client().auth.signInWithPassword({email,password});if(error||!data.session)failure(error,true);return data.session!;}
 async verify(tokenHash:string){const {data,error}=await client().auth.verifyOtp({token_hash:tokenHash,type:"email"});if(error||!data.session){if(error?.status===429)failure(error);if(!error?.status||error.status>=500)failure(error);throw new ApiError(422,"CONFIRMATION_INVALID","A confirmação não é válida ou expirou. Entre ou solicite outro e-mail.");}return data.session!;}
 async resend(email:string){const {error}=await client().auth.resend({type:"signup",email});if(error){if(error.status===429)failure(error);throw new ApiError(503,"EMAIL_SERVICE_UNAVAILABLE","Não foi possível confirmar a solicitação de reenvio.");}}
 async user(token:string){const {data,error}=await client().auth.getUser(token);if(error||!data.user){if(!error?.status||error.status>=500)failure(error);throw new ApiError(401,"INVALID_SESSION","Entre na sua conta para continuar.");}return identity(data.user!);}
 async identity(id:string){const admin=getSupabaseClient();if(!admin)failure(null);const {data,error}=await admin!.auth.admin.getUserById(id);if(error||!data.user)failure(error);return identity(data.user!);}
 async refresh(refreshToken:string):Promise<Session>{const {data,error}=await client().auth.refreshSession({refresh_token:refreshToken});if(error||!data.session)failure(error,true);return data.session!;}
 async logout(token:string){const admin=getSupabaseClient();if(!admin)return;await admin.auth.admin.signOut(token,"local");}
}
