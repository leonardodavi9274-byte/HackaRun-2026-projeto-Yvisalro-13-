import { Router } from "express";
import type { HealthController } from "../controllers/health.controller.ts";

export function createApiRoutes(health: HealthController): Router {
  const router = Router();
  router.get("/", (_request, response) => {
    response.json({
      data: {
        name: "Hackarum-Yvisalro WebAPI",
        version: "v1",
        health: "/api/v1/health",
      },
    });
  });
  router.get("/health", health.get);
  return router;
}
