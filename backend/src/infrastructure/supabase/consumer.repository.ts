import {rpc} from "./rpc.ts";
import type {ConsumerRepository} from "../../application/ports/consumer-repository.ts";
import type {Profile,Receipt,Snapshot} from "../../domain/registration/registration.ts";
export class SupabaseConsumerRepository implements ConsumerRepository{
 profile(userId:string){return rpc<Profile|null>("hy_consumer",{p_user:userId});}
 complete(userId:string,mutationId:string,payload:Snapshot|null,actor:string|null,owner:string|null,finalize:boolean){return rpc<Receipt>("hy_initialize_onboarding",{p_user:userId,p_mutation:mutationId,p_input:payload,p_actor:actor,p_bootstrap_owner:owner,p_finalize:finalize});}
}
