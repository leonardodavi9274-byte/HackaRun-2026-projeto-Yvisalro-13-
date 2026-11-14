/**
 * Modo demonstração: as telas do protótipo funcionam com o catálogo fictício e uma conta
 * local, sem Supabase. Ativação:
 *  - VITE_DEMO_MODE=true  → sempre ligado;
 *  - VITE_DEMO_MODE=false → sempre desligado (use em produção);
 *  - ausente              → ligado quando a API informa que o Supabase não está configurado.
 */
const flag = String(import.meta.env.VITE_DEMO_MODE ?? "").trim().toLowerCase();
const base = (import.meta.env.VITE_API_BASE_URL || "/api/v1").replace(/\/$/, "");

let active = flag === "true";

export async function detectDemoMode() {
  if (flag === "true" || flag === "false") return (active = flag === "true");
  try {
    const response = await fetch(base + "/health", {headers: {Accept: "application/json"}, cache: "no-store"});
    const payload = await response.json();
    active = payload?.data?.database?.configured === false;
  } catch {
    active = false; // sem resposta da API, mantém o fluxo real e seus estados de erro
  }
  return active;
}

export const isDemoMode = () => active;
