import {rpc} from "./rpc.ts";
import type {RegistrationRepository} from "../../application/ports/registration-repository.ts";
import type {Intent,Snapshot} from "../../domain/registration/registration.ts";
export class SupabaseRegistrationRepository implements RegistrationRepository{
 create(id:string,tokenHash:string,proofHash:string,email:string,hash:string,snapshot:Snapshot){return rpc<Intent>("hy_registration_create",{p_id:id,p_token:tokenHash,p_proof:proofHash,p_email:email,p_hash:hash,p_snapshot:snapshot});}
 byId(id:string,tokenHash:string){return rpc<Intent>("hy_registration_by_id",{p_id:id,p_token:tokenHash});}
 byUser(userId:string){return rpc<Intent|null>("hy_registration_by_user",{p_user:userId});}
 claim(id:string,owner:string){return rpc<Intent|null>("hy_registration_claim",{p_id:id,p_owner:owner});}
 finish(id:string,owner:string,state:string,dispatch:string){return rpc<void>("hy_registration_finish",{p_id:id,p_owner:owner,p_state:state,p_dispatch:dispatch});}
}
