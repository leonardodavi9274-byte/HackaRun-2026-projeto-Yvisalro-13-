import type {RequestHandler} from "express";
import type {WebSessionService} from "../../../application/services/web-session.service.ts";
import {ApiError} from "../errors/api-error.ts";
export function requireAuth(sessions:WebSessionService):RequestHandler{
 return async(req,res,next)=>{const user=await sessions.identify(req);if(!user)throw new ApiError(401,"UNAUTHENTICATED","Entre na sua conta para continuar.");res.locals.user=user;next();};
}
