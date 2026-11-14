import {request,mutate} from "../../../shared/services/http-client.js";
import {attemptBody} from "../models/registration-attempt.js";
const headers=a=>({"Idempotency-Key":a.id,"Registration-Token":a.token});
export const registrationRepository={
 config:signal=>request("/registration-config",{signal}),categories:signal=>request("/interest-categories",{signal}),
 create:a=>mutate("/auth/registrations","POST",attemptBody(a),{headers:headers(a)}),
 status:a=>request("/auth/registrations/"+a.id,{headers:{"Registration-Token":a.token}}),
 verify:tokenHash=>mutate("/auth/email/verify","POST",{tokenHash}),resend:email=>mutate("/auth/email/resend","POST",{email}),
 pending:()=>request("/me/onboarding"),complete:(key,corrections)=>mutate("/me/onboarding/complete","POST",corrections?{corrections}:{},{headers:{"Idempotency-Key":key}}),
 profile:()=>request("/me")
};
