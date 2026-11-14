import type {ErrorRequestHandler,RequestHandler} from "express";
import {ApiError} from "../errors/api-error.ts";
export const notFound:RequestHandler=(_req,_res,next)=>next(new ApiError(404,"NOT_FOUND","O recurso solicitado não foi encontrado."));
export const errorHandler:ErrorRequestHandler=(error,_req,res,_next)=>{
 const photo=_req.path.endsWith("/avatar");
 const type=error&&typeof error==="object"&&"type"in error?String(error.type):"";
 const known=error instanceof ApiError?error:type==="entity.parse.failed"?new ApiError(400,"INVALID_JSON","O corpo deve conter JSON válido."):type==="entity.too.large"?new ApiError(413,photo?"PHOTO_TOO_LARGE":"PAYLOAD_TOO_LARGE",photo?"A foto deve ter até 5 MiB.":"O corpo excede o limite permitido."):type==="encoding.unsupported"?new ApiError(415,"CONTENT_ENCODING_UNSUPPORTED","Envie o arquivo sem compressão HTTP."):new ApiError(500,"INTERNAL_ERROR","Não foi possível concluir a solicitação.");
 if(known.retryAfter)res.setHeader("Retry-After",known.retryAfter);
 if(known.statusCode>=500)console.error(JSON.stringify({requestId:res.locals.requestId,code:known.code,stage:"http"}));
 res.status(known.statusCode).json({error:{code:known.code,message:known.message,requestId:res.locals.requestId,...(known.fields?{fields:known.fields}:{}),...(known.retryAfter?{retryAfterSeconds:known.retryAfter}:{})}});
};
