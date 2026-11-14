import type {RegistrationService} from "./registration.service.ts";
import type {ConsumerService} from "./consumer.service.ts";
import type {RegistrationRepository} from "../ports/registration-repository.ts";
import {digest} from "../../infrastructure/sessions/session-codec.ts";
import type {Identity} from "../../domain/registration/registration.ts";
export class OnboardingService{
 readonly registrations:RegistrationService;readonly consumers:ConsumerService;readonly repo:RegistrationRepository;
 constructor(registrations:RegistrationService,consumers:ConsumerService,repo:RegistrationRepository){this.registrations=registrations;this.consumers=consumers;this.repo=repo;}
 async status(id:string,token:string){const intent=await this.repo.byId(id,digest(token));return {registrationId:id,onboarding:await this.registrations.status(intent)};}
 pending(user:Identity){return this.consumers.pending(user);}
 complete(user:Identity,id:string,body:unknown){return this.consumers.complete(user,id,body);}
}
