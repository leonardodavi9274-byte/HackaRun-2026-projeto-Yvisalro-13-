import type {AuthGateway} from "../ports/auth-gateway.ts";
import type {WebSessionService} from "./web-session.service.ts";
import type {ConsumerService} from "./consumer.service.ts";
import {env} from "../../config/env.ts";
import {email,keys,record} from "../../domain/registration/validation.ts";
import {ApiError} from "../../presentation/http/errors/api-error.ts";
export class IdentityService{
 readonly auth:AuthGateway;readonly sessions:WebSessionService;readonly consumers:ConsumerService;
 constructor(auth:AuthGateway,sessions:WebSessionService,consumers:ConsumerService){this.auth=auth;this.sessions=sessions;this.consumers=consumers;}
 async verify(raw:unknown){const v=record(raw);keys(v,["tokenHash"]);if(typeof v.tokenHash!=="string"||!v.tokenHash||v.tokenHash.length>512)throw new ApiError(422,"CONFIRMATION_INVALID","A confirmação não é válida.");const session=await this.auth.verify(v.tokenHash);const established=await this.sessions.establish(session);return {secret:established.secret,data:{authenticated:true,user:established.user,onboarding:await this.consumers.state(established.user)}};}
 async resend(raw:unknown){const v=record(raw);keys(v,["email"]);await this.auth.resend(email(v.email));return {status:"request_accepted",retryAfterSeconds:env.resendInterval};}
}
