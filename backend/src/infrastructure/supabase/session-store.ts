import {rpc} from "./rpc.ts";
import type {SessionStore,StoredSession} from "../../application/ports/session-store.ts";
export class SupabaseSessionStore implements SessionStore{
 create(hash:string,userId:string,tokens:string,expires:number){return rpc<void>("hy_create_session",{p_hash:hash,p_user:userId,p_tokens:tokens,p_expires:expires});}
 get(hash:string){return rpc<StoredSession|null>("hy_get_session",{p_hash:hash});}
 claim(hash:string,owner:string){return rpc<StoredSession|null>("hy_claim_session",{p_hash:hash,p_owner:owner});}
 rotate(hash:string,owner:string,revision:number,tokens:string,expires:number){return rpc<boolean>("hy_rotate_session",{p_hash:hash,p_owner:owner,p_revision:revision,p_tokens:tokens,p_expires:expires});}
 revoke(hash:string){return rpc<void>("hy_revoke_session",{p_hash:hash});}
}
