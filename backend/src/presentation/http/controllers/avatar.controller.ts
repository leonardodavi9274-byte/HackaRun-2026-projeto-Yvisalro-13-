import type {RequestHandler} from "express";
import {user,mutation,type Services} from "./context.ts";
import {ApiError} from "../errors/api-error.ts";
export const checkPhoto:RequestHandler=(req,_res,next)=>{if(req.get("Content-Encoding")&&req.get("Content-Encoding")!=="identity")throw new ApiError(415,"CONTENT_ENCODING_UNSUPPORTED","Envie a imagem sem compressão HTTP.");if(!["image/jpeg","image/png","image/webp"].some(t=>req.is(t)))throw new ApiError(415,"PHOTO_FORMAT_UNSUPPORTED","Escolha JPEG, PNG ou WebP.");next();};
export function avatarController(s:Services):{save:RequestHandler;waive:RequestHandler;download:RequestHandler}{return {
 save:async(req,res)=>{if(!Buffer.isBuffer(req.body)||!req.body.length)throw new ApiError(422,"PHOTO_INVALID","Selecione uma foto válida.");res.json({data:await s.avatars.save(user(res),mutation(req),req.body)});},
 waive:async(req,res)=>res.json({data:await s.avatars.waive(user(res),mutation(req))}),
 download:async(_req,res)=>{const bytes=await s.avatars.download(user(res));res.type("image/webp").setHeader("Cache-Control","private, no-store");res.send(bytes);}
};}
