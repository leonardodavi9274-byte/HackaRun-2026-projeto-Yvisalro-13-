export interface SystemStatus {
  application: "Hackarum-Yvisalro";
  status: "ok";
  timestamp: string;
  uptimeSeconds: number;
  database: {
    provider: "supabase";
    engine: "postgresql";
    configured: boolean;
    connection: "not_checked";
  };
}
