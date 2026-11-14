import type { ErrorRequestHandler, RequestHandler } from "express";
import { ApiError } from "../errors/api-error.ts";

export const notFound: RequestHandler = (_request, _response, next) => {
  next(
    new ApiError(404, "NOT_FOUND", "O recurso solicitado não foi encontrado."),
  );
};

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _request,
  response,
  _next,
) => {
  const invalidJson =
    error instanceof SyntaxError &&
    "type" in error &&
    error.type === "entity.parse.failed";
  const oversizedBody =
    error instanceof Error &&
    "type" in error &&
    error.type === "entity.too.large";
  const statusCode =
    error instanceof ApiError
      ? error.statusCode
      : invalidJson
        ? 400
        : oversizedBody
          ? 413
          : 500;
  const code =
    error instanceof ApiError
      ? error.code
      : invalidJson
        ? "INVALID_JSON"
        : oversizedBody
          ? "PAYLOAD_TOO_LARGE"
          : "INTERNAL_ERROR";
  const message =
    error instanceof ApiError
      ? error.message
      : invalidJson
        ? "O corpo da requisição deve conter JSON válido."
        : oversizedBody
          ? "O corpo da requisição excede o limite permitido."
          : "Não foi possível concluir a solicitação.";

  if (statusCode >= 500) {
    console.error(
      JSON.stringify({
        level: "error",
        code,
        requestId: response.locals.requestId,
      }),
    );
  }
  response
    .status(statusCode)
    .json({ error: { code, message, requestId: response.locals.requestId } });
};
