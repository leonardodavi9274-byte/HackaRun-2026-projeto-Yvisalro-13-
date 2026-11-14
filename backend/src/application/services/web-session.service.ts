import {randomUUID} from "node:crypto";
import type {Session} from "@supabase/supabase-js";
import type {Request,Response} from "express";
import type {AuthGateway} from "../ports/auth-gateway.ts";
import type {SessionStore} from "../ports/session-store.ts";
import {digest,encrypt,decrypt,randomSecret} from "../../infrastructure/sessions/session-codec.ts";
import {sessionCookie,setSessionCookie,clearSessionCookie} from "../../infrastructure/sessions/session-cookie.ts";
import {ApiError} from "../../presentation/http/errors/api-error.ts";
export class WebSessionService{
 readonly auth:AuthGateway;readonly store:SessionStore;
 constructor(auth:AuthGateway,store:SessionStore){this.auth=auth;this.store=store;}
 async establish(session:Session,res:Response){const user=await this.auth.user(session.access_token);if(!user.confirmed)throw new ApiError(403,"EMAIL_CONFIRMATION_REQUIRED","Confirme seu e-mail.");const secret=randomSecret();await this.store.create(digest(secret),user.id,encrypt(session),session.expires_at??Math.floor(Date.now()/1000)+3600);setSessionCookie(res,secret);return user;}
 async identify(req:Request){
  const secret=sessionCookie(req);const bearer=req.headers.authorization?.match(/^Bearer\s+(\S+)$/i)?.[1];
  if(!secret){if(bearer){const user=await this.auth.user(bearer);if(!user.confirmed)throw new ApiError(403,"EMAIL_CONFIRMATION_REQUIRED","Confirme seu e-mail.");return user;}return null;}
  const hash=digest(secret);let row=await this.store.get(hash);if(!row)throw new ApiError(401,"INVALID_SESSION","Entre novamente para continuar.");
  let tokens=decrypt(row.encrypted_tokens);
  if(Date.parse(row.access_expires_at)<Date.now()+60000){
   const owner=randomUUID();const claimed=await this.store.claim(hash,owner);
   if(!claimed)throw new ApiError(503,"SESSION_REFRESH_IN_PROGRESS","A sessão está sendo atualizada. Tente novamente.",undefined,1);
   try{const fresh=await this.auth.refresh(tokens.refresh_token);const saved=await this.store.rotate(hash,owner,claimed.revision,encrypt(fresh),fresh.expires_at??Math.floor(Date.now()/1000)+3600);
   if(!saved)throw new ApiError(401,"INVALID_SESSION","Entre novamente para continuar.");tokens=fresh;
   }catch(error){if(error instanceof ApiError&&error.code==="SESSION_REFRESH_IN_PROGRESS")throw error;await this.store.revoke(hash).catch(()=>{});throw new ApiError(401,"INVALID_SESSION","Entre novamente para continuar.");}
  }
  const user=await this.auth.user(tokens.access_token);
  if(user.id!==row.user_id||!user.confirmed)throw new ApiError(401,"INVALID_SESSION","Entre novamente.");
  if(bearer&&(await this.auth.user(bearer)).id!==user.id)throw new ApiError(401,"IDENTITY_CONFLICT","As identidades não correspondem.");
  return user;
 }
 async logout(req:Request,res:Response){const secret=sessionCookie(req);if(secret){const hash=digest(secret);const row=await this.store.get(hash);await this.store.revoke(hash);if(row)await this.auth.logout(decrypt(row.encrypted_tokens).access_token).catch(()=>{});}clearSessionCookie(res);}
}
