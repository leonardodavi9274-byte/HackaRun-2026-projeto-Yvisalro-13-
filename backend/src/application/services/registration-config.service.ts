import {env,registrationReady} from "../../config/env.ts";
import {NOTICE_TEXT,NOTICE_VERSION} from "../../domain/registration/registration.ts";
import {ApiError} from "../../presentation/http/errors/api-error.ts";
export class RegistrationConfigService{
 requireReady(){if(!registrationReady())throw new ApiError(503,"REGISTRATION_NOT_CONFIGURED","O cadastro ainda não está disponível. A configuração de identidade e documentos precisa ser concluída.");}
 get(){this.requireReady();return {passwordPolicy:{minCharacters:8,maxUtf8Bytes:72,strongMinCharacters:12},photoPolicy:{mimeTypes:["image/jpeg","image/png","image/webp"],maxBytes:5242880,maxPixels:25000000,staticAvatar:true},marketingNotice:{version:NOTICE_VERSION,text:NOTICE_TEXT,defaultAllowed:false},legal:{termsUrl:env.termsUrl,privacyUrl:env.privacyUrl}};}
}
