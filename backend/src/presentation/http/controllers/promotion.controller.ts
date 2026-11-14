import type {RequestHandler} from "express";
import type {Services} from "./context.ts";
export function promotionController(s:Services):{list:RequestHandler;confirm:RequestHandler}{
 return {
  list:async(req,res)=>{res.setHeader("Cache-Control","no-store");const mallId=typeof req.query.mallId==="string"?req.query.mallId:"";res.json({data:await s.promotions.list(mallId)});},
  confirm:async(req,res)=>{res.setHeader("Cache-Control","no-store");const mallId=typeof req.query.mallId==="string"?req.query.mallId:"";const raw=typeof req.query.revision==="string"?req.query.revision:"";const revision=/^[1-9][0-9]*$/.test(raw)?Number(raw):NaN;res.json({data:await s.promotions.confirm(mallId,String(req.params.id),revision)});}
 };
}
