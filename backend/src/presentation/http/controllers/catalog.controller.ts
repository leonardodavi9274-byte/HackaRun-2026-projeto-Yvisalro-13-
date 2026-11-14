import type {Request,Response} from "express";
import type {Services} from "./context.ts";

export function catalogController(services:Services){
 return {
  categories:async(_req:Request,res:Response)=>res.json({data:await services.catalog.categories()}),
  search:async(req:Request,res:Response)=>res.json({data:await services.catalogSearch.search(req.query)}),
  product:async(req:Request,res:Response)=>res.json({data:await services.catalog.product(String(req.params.id))}),
  offer:async(req:Request,res:Response)=>res.json({data:await services.catalog.offer(String(req.params.id))}),
  variant:async(req:Request,res:Response)=>res.json({data:await services.catalogComparison.get(String(req.params.id))}),
  similar:async(req:Request,res:Response)=>res.json({data:await services.catalogSimilar.list(String(req.params.id))})
 };
}
