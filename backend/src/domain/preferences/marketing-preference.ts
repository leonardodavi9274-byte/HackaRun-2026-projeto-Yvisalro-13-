import {NOTICE_VERSION} from "../registration/registration.ts";
import {record,keys} from "../registration/validation.ts";
import {ApiError} from "../../presentation/http/errors/api-error.ts";
export function marketingPreference(body:unknown){const v=record(body);keys(v,["allowed","noticeVersion"]);if(typeof v.allowed!=="boolean")throw new ApiError(422,"VALIDATION_ERROR","Informe sua escolha de publicidade.");if(v.noticeVersion!==NOTICE_VERSION)throw new ApiError(409,"NOTICE_VERSION_CHANGED","Leia o aviso atualizado e confirme sua escolha.");return {allowed:v.allowed,noticeVersion:NOTICE_VERSION};}
