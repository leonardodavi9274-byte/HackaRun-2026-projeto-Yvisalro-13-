import type {RequestHandler} from "express";
import type {Services} from "./context.ts";
import {setSessionCookie,sessionCookie,clearSessionCookie} from "../../../infrastructure/sessions/session-cookie.ts";
export function sessionController(s:Services):{login:RequestHandler;current:RequestHandler;logout:RequestHandler}{return{
 login:async(req,res)=>{const r=await s.sessions.login(req.body);setSessionCookie(res,r.secret);res.json({data:r.data});},
 current:async(req,res)=>res.json({data:await s.sessions.current(sessionCookie(req),req.headers.authorization?.match(/^Bearer\s+(\S+)$/i)?.[1])}),
 logout:async(req,res)=>{await s.webSessions.logout(sessionCookie(req));clearSessionCookie(res);res.json({data:{authenticated:false}});}
};}
