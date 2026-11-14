const port = Number(process.env.PORT ?? 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT deve ser uma porta válida entre 1 e 65535.");
}

const supabaseUrl = process.env.SUPABASE_URL?.trim() || undefined;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY?.trim() || undefined;
if (Boolean(supabaseUrl) !== Boolean(supabaseSecretKey)) {
  throw new Error("Configure SUPABASE_URL e SUPABASE_SECRET_KEY juntas.");
}
if (supabaseUrl) {
  const parsedUrl = new URL(supabaseUrl);
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(
    parsedUrl.hostname,
  );
  if (
    parsedUrl.protocol !== "https:" &&
    !(local && parsedUrl.protocol === "http:")
  ) {
    throw new Error("SUPABASE_URL deve usar HTTPS, exceto em ambiente local.");
  }
}

export const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV ?? "development",
  host: process.env.HOST ?? "127.0.0.1",
  port,
  frontendOrigins: (
    process.env.FRONTEND_ORIGIN ?? "http://localhost:5173,http://127.0.0.1:5173"
  )
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  supabaseUrl,
  supabaseSecretKey,
});
