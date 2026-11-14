import type {RequestHandler} from "express";
import {env} from "../../../config/env.ts";
import {ApiError} from "../errors/api-error.ts";
export const webRequestGuard:RequestHandler=(req,res,next)=>{
 res.setHeader("Cache-Control","private, no-store");res.vary("Cookie");
 if(!["GET","HEAD","OPTIONS"].includes(req.method)){
  if(!req.headers.origin||!env.frontendOrigins.includes(req.headers.origin))throw new ApiError(403,"ORIGIN_NOT_ALLOWED","Origem não autorizada.");
  if(req.get("X-App-Request")!=="web")throw new ApiError(403,"REQUEST_HEADER_REQUIRED","A solicitação não pôde ser validada.");
 }
 next();
};
