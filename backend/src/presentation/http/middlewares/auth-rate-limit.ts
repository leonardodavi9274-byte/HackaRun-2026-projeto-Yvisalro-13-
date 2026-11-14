import type {RequestHandler} from "express";
import {createHash} from "node:crypto";
import {env} from "../../../config/env.ts";
import {ApiError} from "../errors/api-error.ts";
const buckets=new Map<string,{count:number;until:number}>();
export function authRateLimit(kind:"signup"|"login"|"resend"):RequestHandler{
 return(req,_res,next)=>{const now=Date.now();for(const [key,v]of buckets)if(v.until<=now)buckets.delete(key);
 const window=(kind==="resend"?env.resendInterval:900)*1000;const max=kind==="resend"?1:10;
 const ids=[kind+":"+(req.ip??"unknown")];
 if(kind==="resend"&&typeof req.body?.email==="string")ids.push(kind+":email:"+createHash("sha256").update(req.body.email.trim().toLowerCase()).digest("hex"));
 for(const id of ids){const b=buckets.get(id);if(b&&b.count>=max)throw new ApiError(429,"AUTH_RATE_LIMITED","Aguarde antes de tentar novamente.",undefined,Math.ceil((b.until-now)/1000));}
 if(buckets.size>10000)throw new ApiError(503,"AUTH_BUSY","O serviço está ocupado. Tente novamente.");
 for(const id of ids){const b=buckets.get(id);buckets.set(id,b?{...b,count:b.count+1}:{count:1,until:now+window});}next();
 };
}
