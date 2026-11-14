const baseUrl = (import.meta.env.VITE_API_BASE_URL || "/api/v1").replace(
  /\/$/,
  "",
);

export async function getJson(path, { signal } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    signal,
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      payload?.error?.message || "Não foi possível acessar o serviço.",
    );
  }
  if (!payload?.data)
    throw new Error("O serviço retornou uma resposta inesperada.");
  return payload.data;
}
