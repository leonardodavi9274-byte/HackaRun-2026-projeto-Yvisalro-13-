import {Router} from "express";
import type {HomeContentService} from "../../../application/services/home-content.service.ts";
import {homeController} from "../controllers/home.controller.ts";
// Somente leitura: nenhum método de escrita é registrado para /home.
export function homeRoutes(service: HomeContentService) {
  const router = Router(), controller = homeController(service);
  router.get("/home", controller.get);
  return router;
}
