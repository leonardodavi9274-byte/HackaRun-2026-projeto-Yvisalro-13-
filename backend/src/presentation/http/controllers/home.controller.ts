import type {RequestHandler} from "express";
import type {HomeContentService} from "../../../application/services/home-content.service.ts";
// GET público: sem sessão, sem gravação; erros seguem o envelope do errorHandler.
export function homeController(service: HomeContentService): {get: RequestHandler} {
  return {get: async (_req, res) => {res.setHeader("Cache-Control", "no-store"); res.json({data: await service.get()});}};
}
