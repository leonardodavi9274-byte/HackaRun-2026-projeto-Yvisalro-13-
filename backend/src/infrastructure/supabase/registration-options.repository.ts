import {getSupabaseClient} from "./client.ts";
import {ApiError} from "../../presentation/http/errors/api-error.ts";
export class RegistrationOptionsRepository{
 async categories(){const db=getSupabaseClient();if(!db)throw new ApiError(503,"CATEGORIES_UNAVAILABLE","As categorias estão indisponíveis.");const {data,error}=await db.from("interest_categories").select("id,label,sort_order").eq("active",true).order("sort_order");if(error)throw new ApiError(503,"CATEGORIES_UNAVAILABLE","As categorias estão indisponíveis.");return (data??[]).map(c=>({id:c.id,label:c.label,order:c.sort_order}));}
}
