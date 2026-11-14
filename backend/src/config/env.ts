const value = (name: string) => process.env[name]?.trim() || undefined;
const local = (url: URL) => ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
function url(name: string, fallback?: string) {
  const raw = value(name) ?? fallback;
  if (!raw) return undefined;
  const parsed = new URL(raw);
  if (parsed.username || parsed.password || (parsed.protocol !== "https:" && !(local(parsed) && parsed.protocol === "http:"))) {
    throw new Error(name + " deve ser URL HTTPS, ou HTTP local, sem credenciais.");
  }
  return parsed.toString().replace(/\/$/, "");
}
function integer(name: string, fallback: number, min = 1, max = 65535) {
  const result = Number(value(name) ?? fallback);
  if (!Number.isInteger(result) || result < min || result > max) throw new Error(name + " inválido.");
  return result;
}
const appOrigin = url("APP_ORIGIN", "http://127.0.0.1:5173")!;
if (new URL(appOrigin).origin !== appOrigin) throw new Error("APP_ORIGIN deve conter apenas a origem.");
const securityKey = value("APP_SECURITY_KEY");
if (securityKey && (!/^[A-Za-z0-9+/]{43}=$/.test(securityKey) || Buffer.from(securityKey, "base64").length !== 32)) {
  throw new Error("APP_SECURITY_KEY deve representar 32 bytes em base64.");
}
const supabaseUrl = url("SUPABASE_URL");
const supabaseSecretKey = value("SUPABASE_SECRET_KEY");
if (Boolean(supabaseUrl) !== Boolean(supabaseSecretKey)) throw new Error("Configure SUPABASE_URL e SUPABASE_SECRET_KEY juntas.");
const frontendOrigins = (value("FRONTEND_ORIGIN") ?? appOrigin).split(",").map(s => s.trim());
if (frontendOrigins.some(s => new URL(s).origin !== s)) throw new Error("FRONTEND_ORIGIN deve conter origens exatas.");
export const env = Object.freeze({
  nodeEnv: value("NODE_ENV") ?? "development", host: value("HOST") ?? "127.0.0.1", port: integer("PORT", 3000),
  appOrigin, frontendOrigins, supabaseUrl, supabaseSecretKey, securityKey,
  supabasePublishableKey: value("SUPABASE_PUBLISHABLE_KEY"),
  termsUrl: url("TERMS_URL"), privacyUrl: url("PRIVACY_URL"),
  confirmationTtl: integer("AUTH_CONFIRMATION_TTL_SECONDS", 3600, 60, 86400),
  resendInterval: integer("AUTH_RESEND_MIN_INTERVAL_SECONDS", 60, 60, 86400),
});
export const registrationReady = () => Boolean(env.supabaseUrl && env.supabaseSecretKey && env.supabasePublishableKey && env.securityKey && env.termsUrl && env.privacyUrl);
