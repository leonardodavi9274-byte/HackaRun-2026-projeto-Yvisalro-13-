import type { SystemStatus } from "../../domain/system/system-status.ts";

export class SystemStatusService {
  private readonly databaseConfigured: boolean;

  constructor(databaseConfigured: boolean) {
    this.databaseConfigured = databaseConfigured;
  }

  execute(): SystemStatus {
    return {
      application: "Hackarum-Yvisalro",
      status: "ok",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      database: {
        provider: "supabase",
        engine: "postgresql",
        configured: this.databaseConfigured,
        connection: "not_checked",
      },
    };
  }
}
