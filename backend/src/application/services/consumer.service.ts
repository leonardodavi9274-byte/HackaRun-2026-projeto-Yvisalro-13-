import type {ConsumerRepository} from "../ports/consumer-repository.ts";
import type {RegistrationRepository} from "../ports/registration-repository.ts";
import type {Identity} from "../../domain/registration/registration.ts";
import {snapshot,keys,record} from "../../domain/registration/validation.ts";
import {onboarding} from "../../domain/registration/onboarding-state.ts";
import {ApiError} from "../../presentation/http/errors/api-error.ts";
export class ConsumerService{
 readonly consumers:ConsumerRepository;readonly registrations:RegistrationRepository;
 constructor(consumers:ConsumerRepository,registrations:RegistrationRepository){this.consumers=consumers;this.registrations=registrations;}
 async state(user:Identity){const [i,p]=await Promise.all([this.registrations.byUser(user.id),this.consumers.profile(user.id)]);return onboarding(i,true,user.confirmed,p?.completedAt);}
 async get(user:Identity){const profile=await this.consumers.profile(user.id);if(!profile)throw new ApiError(409,"ONBOARDING_INCOMPLETE","Conclua os dados do cadastro.");return {...profile,email:user.email,onboarding:await this.state(user)};}
 async pending(user:Identity){const [i,p]=await Promise.all([this.registrations.byUser(user.id),this.consumers.profile(user.id)]);return {onboarding:onboarding(i,true,user.confirmed,p?.completedAt),savedData:p?{name:p.name,interests:p.interests,marketing:p.marketing}:null,pendingDraft:i?.data_state==="pending"?i.snapshot:null};}
 async complete(user:Identity,id:string,body:unknown){const v=record(body);keys(v,["corrections"]);const i=await this.registrations.byUser(user.id);if(!i)throw new ApiError(409,"ONBOARDING_INCOMPLETE","Este cadastro precisa de atendimento para ser retomado.");let payload=null;
 if(v.corrections!==undefined){const c=record(v.corrections);keys(c,["name","categoryIds","productInterests","marketing"]);payload=snapshot(c,i.photo_state!=="not_requested");}
 const receipt=await this.consumers.complete(user.id,id,payload,user.id,null,true);return {onboarding:await this.state(user),receipt};}
}
