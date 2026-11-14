import {upload,mutate} from "../../../shared/services/http-client.js";
export const photoRepository={save:(file,id)=>upload("/me/onboarding/avatar",file,id),waive:id=>mutate("/me/onboarding/avatar","DELETE",undefined,{headers:{"Idempotency-Key":id}})};
