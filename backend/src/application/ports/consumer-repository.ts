import type {Profile,Receipt,Snapshot} from "../../domain/registration/registration.ts";
export interface ConsumerRepository {
 profile(userId:string):Promise<Profile|null>;
 complete(userId:string,mutationId:string,payload:Snapshot|null,actor:string|null,owner:string|null,finalize:boolean):Promise<Receipt>;
}
