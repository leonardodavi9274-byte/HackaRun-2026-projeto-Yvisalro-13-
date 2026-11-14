import {request,mutate} from "../../../shared/services/http-client.js";
export const sessionRepository={current:()=>request("/auth/session"),login:body=>mutate("/auth/sessions","POST",body),logout:()=>mutate("/auth/session","DELETE")};
