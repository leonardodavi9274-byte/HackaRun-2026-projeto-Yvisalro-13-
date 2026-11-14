import type {RequestHandler} from "express";
import type {Services} from "./context.ts";
import {setSessionCookie} from "../../../infrastructure/sessions/session-cookie.ts";
export function identityController(s:Services):{verify:RequestHandler;resend:RequestHandler}{return {verify:async(req,res)=>{const r=await s.identity.verify(req.body);setSessionCookie(res,r.secret);res.json({data:r.data});},resend:async(req,res)=>res.status(202).json({data:await s.identity.resend(req.body)})};}
