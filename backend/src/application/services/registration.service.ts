import {randomUUID} from "node:crypto";
import type {Session} from "@supabase/supabase-js";
import type {AuthGateway} from "../ports/auth-gateway.ts";
import type {RegistrationRepository} from "../ports/registration-repository.ts";
import type {ConsumerRepository} from "../ports/consumer-repository.ts";
import type {Intent,Snapshot} from "../../domain/registration/registration.ts";
import {registration} from "../../domain/registration/validation.ts";
import {onboarding} from "../../domain/registration/onboarding-state.ts";
import {bindingProof,digest} from "../../infrastructure/sessions/session-codec.ts";
import {ApiError} from "../../presentation/http/errors/api-error.ts";
import type {RegistrationConfigService} from "./registration-config.service.ts";
export class RegistrationService{
 readonly auth:AuthGateway;readonly repo:RegistrationRepository;readonly consumers:ConsumerRepository;readonly config:RegistrationConfigService;
 constructor(auth:AuthGateway,repo:RegistrationRepository,consumers:ConsumerRepository,config:RegistrationConfigService){this.auth=auth;this.repo=repo;this.consumers=consumers;this.config=config;}
 async status(i:Intent,authenticated=false){if(!i.user_id)return onboarding(i);const [u,p]=await Promise.all([this.auth.identity(i.user_id),this.consumers.profile(i.user_id)]);return onboarding(i,authenticated,u.confirmed,p?.completedAt);}
 async create(raw:unknown,id:string,token:string){
  this.config.requireReady();const input=registration(raw);const {email,password,mode,...draft}=input;const s:Snapshot=draft;
  const proof=bindingProof(id,email);let intent=await this.repo.create(id,digest(token),digest(proof),email,digest(JSON.stringify({email,mode,...s})),s);
  if(intent.user_id)return {http:200,data:{registrationId:id,onboarding:await this.status(intent)},session:null};
  const owner=randomUUID();const claim=await this.repo.claim(id,owner);
  if(!claim)return {http:202,data:{registrationId:id,onboarding:await this.status(intent)},session:null};
  let session:Session|null=null;let accepted=false;let failedCode:string|null=null;let uncertain=false;
  try{const result=await this.auth.signup(email,password,{registration_id:id,registration_proof:proof});session=result.session;accepted=result.accepted;failedCode=result.failedCode;}catch{uncertain=true;}
  try{intent=await this.repo.byId(id,digest(token));}catch{return {http:202,data:{registrationId:id,onboarding:{status:"unknown",pendingActions:["check_status"],preferredNextAction:"check_status",retryAfterSeconds:3}},session:null};}
  if(!intent.user_id){await this.repo.finish(id,owner,uncertain?"unknown":"not_created",uncertain?"unknown":accepted?"accepted":"failed");if(uncertain)return {http:202,data:{registrationId:id,onboarding:onboarding({...intent,identity_state:"unknown"})},session:null};
   if(failedCode==="AUTH_RATE_LIMITED")throw new ApiError(429,"AUTH_RATE_LIMITED","Aguarde antes de tentar novamente.",undefined,60);
   throw new ApiError(409,"REGISTRATION_NOT_COMPLETED","Não foi possível concluir com este e-mail. Entre na sua conta ou consulte as opções de recuperação de acesso.");}
  const issues=[];
  try{await this.consumers.complete(intent.user_id,id,s,null,owner,false);}catch(e){issues.push({stage:"profile",code:e instanceof ApiError?e.code:"PROFILE_SAVE_FAILED",message:"A conta existe, mas os dados ainda precisam ser concluídos.",...(e instanceof ApiError&&e.fields?{fields:e.fields}:{})});}
  await this.repo.finish(id,owner,"bound",uncertain?"unknown":accepted?"accepted":"failed").catch(()=>{});
  intent=await this.repo.byId(id,digest(token));
  if(session&&session.user.id!==intent.user_id)session=null;
  return {http:issues.length?202:201,data:{registrationId:id,onboarding:await this.status(intent,Boolean(session)),emailDispatch:uncertain?"unknown":accepted?"accepted":"failed",...(issues.length?{issues}:{})},session};
 }
}
