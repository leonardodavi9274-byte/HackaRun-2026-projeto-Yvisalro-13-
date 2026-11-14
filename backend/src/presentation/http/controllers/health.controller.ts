import type { RequestHandler } from "express";
import type { SystemStatusService } from "../../../application/services/system-status.service.ts";

export class HealthController {
  private readonly systemStatus: SystemStatusService;

  constructor(systemStatus: SystemStatusService) {
    this.systemStatus = systemStatus;
  }

  get: RequestHandler = (_request, response) => {
    response.setHeader("Cache-Control", "no-store");
    response.status(200).json({ data: this.systemStatus.execute() });
  };
}
