import type {RequestHandler} from "express";
import {user,mutation,type Services} from "./context.ts";
export function marketingController(s:Services):RequestHandler{return async(req,res)=>res.json({data:await s.marketing.set(user(res).id,mutation(req),req.body)});}
