import type {RequestHandler} from "express";
import {user,type Services} from "./context.ts";
export function consumerController(s:Services):RequestHandler{return async(_req,res)=>res.json({data:await s.consumers.get(user(res))});}
