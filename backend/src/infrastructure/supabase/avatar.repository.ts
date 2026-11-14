import {getSupabaseClient} from "./client.ts";
import {rpc} from "./rpc.ts";
import {digest} from "../sessions/session-codec.ts";
import type {AvatarRepository,AvatarOperation} from "../../application/ports/avatar-repository.ts";
import type {Receipt} from "../../domain/registration/registration.ts";
import {ApiError} from "../../presentation/http/errors/api-error.ts";
const bucket="consumer-avatars";
const failed=()=>new ApiError(503,"PHOTO_SAVE_FAILED","Não foi possível confirmar a foto. Tente novamente ou continue sem foto.");
function storage(){const db=getSupabaseClient();if(!db)throw failed();return db.storage.from(bucket);}
function pathFor(user:string,path:string){if(!path.startsWith(user+"/")||!/^[0-9a-f-]{36}\/[0-9a-f-]{36}\.webp$/i.test(path))throw failed();}
export class SupabaseAvatarRepository implements AvatarRepository{
 claim(user:string,id:string,kind:"upload"|"waive",hash:string|null){return rpc<AvatarOperation>("hy_avatar_claim",{p_user:user,p_mutation:id,p_kind:kind,p_digest:hash});}
 async upload(user:string,path:string,bytes:Buffer){pathFor(user,path);const {error}=await storage().upload(path,bytes,{contentType:"image/webp",upsert:false,cacheControl:"0"});if(error){const existing=await storage().download(path);if(existing.error||!existing.data||digest(Buffer.from(await existing.data.arrayBuffer()))!==digest(bytes))throw failed();}}
 uploaded(user:string,id:string,hash:string){return rpc<void>("hy_avatar_uploaded",{p_user:user,p_mutation:id,p_digest:hash});}
 finish(user:string,id:string){return rpc<Receipt>("hy_avatar_finish",{p_user:user,p_mutation:id});}
 async download(user:string){const path=await rpc<string|null>("hy_avatar_path",{p_user:user});if(!path)throw new ApiError(404,"PHOTO_NOT_FOUND","Sua conta não tem foto.");pathFor(user,path);const {data,error}=await storage().download(path);if(error||!data)throw new ApiError(503,"PHOTO_UNAVAILABLE","Não foi possível carregar sua foto.");return Buffer.from(await data.arrayBuffer());}
}
