import {rpc} from "./rpc.ts";
import type {MarketingRepository} from "../../application/ports/marketing-repository.ts";
import type {Profile,Receipt} from "../../domain/registration/registration.ts";
export class SupabaseMarketingRepository implements MarketingRepository{
 set(userId:string,mutationId:string,allowed:boolean,noticeVersion:string){return rpc<{marketing:Profile["marketing"];receipt:Receipt}>("hy_set_marketing",{p_user:userId,p_mutation:mutationId,p_allowed:allowed,p_notice:noticeVersion});}
}
