import type { RequestHandler } from "express";
import { getSupabaseClient } from "../../../infrastructure/supabase/client.ts";
import { ApiError } from "../errors/api-error.ts";

// Aplicar nas futuras rotas restritas; autorização por empresa ainda deve ser implementada.
export const requireAuth: RequestHandler = async (request, response, next) => {
  const authorization = request.headers.authorization;
  const match = authorization?.match(/^Bearer\s+(\S+)$/i);
  if (!match?.[1])
    throw new ApiError(
      401,
      "UNAUTHENTICATED",
      "Entre na sua conta para continuar.",
    );
  const supabase = getSupabaseClient();
  if (!supabase)
    throw new ApiError(
      503,
      "AUTH_NOT_CONFIGURED",
      "A autenticação ainda não foi configurada.",
    );
  const { data, error } = await supabase.auth.getUser(match[1]);
  if (error || !data.user)
    throw new ApiError(
      401,
      "INVALID_SESSION",
      "Sua sessão é inválida ou expirou.",
    );
  response.locals.user = { id: data.user.id };
  next();
};
