export type StoredSession={session_hash:string;user_id:string;encrypted_tokens:string;revision:number;expires_at:string;access_expires_at:string;refresh_lease_owner:string|null;refresh_lease_expires_at:string|null};
export interface SessionStore{
 create(hash:string,userId:string,tokens:string,expires:number):Promise<void>;
 get(hash:string):Promise<StoredSession|null>;
 claim(hash:string,owner:string):Promise<StoredSession|null>;
 rotate(hash:string,owner:string,revision:number,tokens:string,expires:number):Promise<boolean>;
 revoke(hash:string):Promise<void>;
}
