import {request,mutate} from "../../../shared/services/http-client.js";
export const accountPreferencesRepository={get:()=>request("/me"),save:(allowed,noticeVersion,id)=>mutate("/me/marketing-preference","PATCH",{allowed,noticeVersion},{headers:{"Idempotency-Key":id}})};
