import type {Profile,Receipt} from "../../domain/registration/registration.ts";
export interface MarketingRepository {set(userId:string,mutationId:string,allowed:boolean,noticeVersion:string):Promise<{marketing:Profile["marketing"];receipt:Receipt}>;}
