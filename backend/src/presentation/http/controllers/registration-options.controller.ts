import type {RequestHandler} from "express";
import type {Services} from "./context.ts";
export function registrationOptionsController(s:Services):{config:RequestHandler;categories:RequestHandler}{return {config:(_req,res)=>res.json({data:s.config.get()}),categories:async(_req,res)=>res.json({data:{categories:await s.options.categories()}})};}
