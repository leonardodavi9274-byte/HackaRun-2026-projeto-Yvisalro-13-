import type {Intent,Snapshot} from "../../domain/registration/registration.ts";
export interface RegistrationRepository {
 create(id:string,tokenHash:string,proofHash:string,email:string,hash:string,snapshot:Snapshot):Promise<Intent>;
 byId(id:string,tokenHash:string):Promise<Intent>;
 byUser(userId:string):Promise<Intent|null>;
 claim(id:string,owner:string):Promise<Intent|null>;
 finish(id:string,owner:string,state:string,dispatch:string):Promise<void>;
}
