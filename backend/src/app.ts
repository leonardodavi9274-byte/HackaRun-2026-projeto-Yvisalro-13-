import { randomUUID } from "node:crypto";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.ts";
import { SystemStatusService } from "./application/services/system-status.service.ts";
import { isSupabaseConfigured } from "./infrastructure/supabase/client.ts";
import { HealthController } from "./presentation/http/controllers/health.controller.ts";
import { ApiError } from "./presentation/http/errors/api-error.ts";
import {
  errorHandler,
  notFound,
} from "./presentation/http/middlewares/error-handler.ts";
import { createApiRoutes } from "./presentation/http/routes/index.ts";

export function createApp() {
  const app = express();
  const health = new HealthController(
    new SystemStatusService(isSupabaseConfigured()),
  );
  app.disable("x-powered-by");
  app.use((_request, response, next) => {
    response.locals.requestId = randomUUID();
    response.setHeader("X-Request-Id", response.locals.requestId);
    next();
  });
  app.use(helmet());
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || env.frontendOrigins.includes(origin))
          callback(null, true);
        else
          callback(
            new ApiError(403, "ORIGIN_NOT_ALLOWED", "Origem não autorizada."),
          );
      },
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.get("/health", health.get);
  app.use("/api/v1", createApiRoutes(health));
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
