import type {RequestHandler} from "express";
import type {Services} from "./context.ts";
/** GET /mall é público: não lê o cookie de sessão e não recebe posição nem ponto de partida. */
export function mallController(s: Services): {get: RequestHandler} {
  return {get: async (_req, res) => { res.json({data: await s.mall.activeMall(res.locals.requestId)}); }};
}
