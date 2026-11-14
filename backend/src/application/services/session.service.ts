import type {AuthGateway} from "../ports/auth-gateway.ts";
import type {WebSessionService} from "./web-session.service.ts";
import type {ConsumerService} from "./consumer.service.ts";
import {email,password,record,keys} from "../../domain/registration/validation.ts";
import type {Identity} from "../../domain/registration/registration.ts";
export class SessionService{
 readonly auth:AuthGateway;readonly sessions:WebSessionService;readonly consumers:ConsumerService;
 constructor(auth:AuthGateway,sessions:WebSessionService,consumers:ConsumerService){this.auth=auth;this.sessions=sessions;this.consumers=consumers;}
 async data(user:Identity|null){return user?{authenticated:true,user:{id:user.id,email:user.email,emailConfirmed:user.confirmed},onboarding:await this.consumers.state(user)}:{authenticated:false};}
 async login(raw:unknown){const v=record(raw);keys(v,["email","password"]);const session=await this.auth.login(email(v.email),password(v.password));const result=await this.sessions.establish(session);return {secret:result.secret,data:await this.data(result.user)};}
 async current(secret?:string,bearer?:string){return this.data(await this.sessions.identify(secret,bearer));}
}
