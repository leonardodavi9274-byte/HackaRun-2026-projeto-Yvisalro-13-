import type {Request,Response} from "express";
import {env} from "../../config/env.ts";
import {ApiError} from "../../presentation/http/errors/api-error.ts";
const options=()=>({httpOnly:true,secure:env.nodeEnv!=="development"||new URL(env.appOrigin).protocol==="https:",sameSite:"lax" as const,path:"/api/v1"});
export function sessionCookie(req:Request){const values=(req.headers.cookie??"").split(";").map(s=>s.trim()).filter(s=>s.startsWith("hy_session="));if(values.length>1)throw new ApiError(401,"INVALID_SESSION","Entre novamente.");const value=values[0]?.slice("hy_session=".length);if(value&&!/^[A-Za-z0-9_-]{43}$/.test(value))throw new ApiError(401,"INVALID_SESSION","Entre novamente.");return value;}
export function setSessionCookie(res:Response,id:string){res.cookie("hy_session",id,{...options(),maxAge:604800000});}
export function clearSessionCookie(res:Response){res.clearCookie("hy_session",options());}
