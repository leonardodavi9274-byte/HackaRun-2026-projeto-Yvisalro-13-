import type {RequestHandler} from "express";
import {mutation,registrationProof,type Services} from "./context.ts";
import {setSessionCookie} from "../../../infrastructure/sessions/session-cookie.ts";
export function registrationController(s:Services):RequestHandler{return async(req,res)=>{
 const result=await s.registrations.create(req.body,mutation(req),registrationProof(req));
 if(result.session){try{const established=await s.webSessions.establish(result.session);setSessionCookie(res,established.secret);}catch{result.http=202;result.data.onboarding={...result.data.onboarding,status:"awaiting_authentication",pendingActions:["authenticate",...result.data.onboarding.pendingActions.filter(a=>a!=="authenticate")],preferredNextAction:"authenticate"};}}
 res.status(result.http).json({data:result.data});
};}
