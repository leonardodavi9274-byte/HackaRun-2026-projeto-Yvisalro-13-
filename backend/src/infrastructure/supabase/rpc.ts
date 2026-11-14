import {getSupabaseClient} from "./client.ts";
import {ApiError} from "../../presentation/http/errors/api-error.ts";
const codes:Record<string,[number,string]>={
 REGISTRATION_PROOF_INVALID:[401,"A referência do cadastro não é válida."],REGISTRATION_PROOF_EXPIRED:[410,"Entre na sua conta para retomar o cadastro."],
 IDEMPOTENCY_CONFLICT:[409,"Esta operação já foi usada com dados diferentes."],ONBOARDING_ALREADY_SAVED:[409,"Os dados já foram salvos. Consulte o estado atual."],
 ONBOARDING_ALREADY_COMPLETED:[409,"O cadastro já foi concluído."],PROFILE_PENDING:[409,"Conclua primeiro os dados da conta."],
 CATEGORY_INVALID:[422,"Uma categoria não está mais disponível. Revise sua seleção."],VALIDATION_ERROR:[422,"Revise os dados informados."],
 NOTICE_VERSION_CHANGED:[409,"Leia o aviso atualizado e confirme sua escolha."],UNAUTHENTICATED:[401,"Entre na mesma conta para continuar."]
};
export async function rpc<T>(name:string,args:Record<string,unknown>={}):Promise<T>{
 const db=getSupabaseClient();if(!db)throw new ApiError(503,"AUTH_NOT_CONFIGURED","A integração ainda não foi configurada.");
 const {data,error}=await db.rpc(name,args);
 if(error){const key=Object.keys(codes).find(c=>error.message===c);const mapped=key?codes[key]:undefined;
 if(mapped)throw new ApiError(mapped[0],key!,mapped[1],key==="CATEGORY_INVALID"?[{field:"categoryIds",code:key,message:mapped[1]}]:undefined);
 throw new ApiError(503,"DATA_SERVICE_UNAVAILABLE","Não foi possível confirmar a operação no serviço de dados.");
 }return data as T;
}
