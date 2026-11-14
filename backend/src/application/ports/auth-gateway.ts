import type {Session} from "@supabase/supabase-js";
import type {Identity} from "../../domain/registration/registration.ts";
export interface AuthGateway {
 signup(email:string,password:string,metadata:Record<string,string>):Promise<{session:Session|null;accepted:boolean;failedCode:string|null;retryAfter?:number}>;
 login(email:string,password:string):Promise<Session>;
 verify(tokenHash:string):Promise<Session>;
 resend(email:string):Promise<void>;
 user(accessToken:string):Promise<Identity>;
 identity(id:string):Promise<Identity>;
 refresh(refreshToken:string):Promise<Session>;
 logout(accessToken:string):Promise<void>;
}
