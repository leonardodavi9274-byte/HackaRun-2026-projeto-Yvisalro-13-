import type {RequestHandler} from "express";
import type {WebSessionService} from "../../../application/services/web-session.service.ts";
import {sessionCookie} from "../../../infrastructure/sessions/session-cookie.ts";
import {ApiError} from "../errors/api-error.ts";
export function requireAuth(sessions:WebSessionService):RequestHandler{
 return async(req,res,next)=>{const bearer=req.headers.authorization?.match(/^Bearer\s+(\S+)$/i)?.[1];const user=await sessions.identify(sessionCookie(req),bearer);if(!user)throw new ApiError(401,"UNAUTHENTICATED","Entre na sua conta para continuar.");res.locals.user=user;next();};
}
