import type {Receipt} from "../../domain/registration/registration.ts";
export type AvatarOperation={mutation_id:string;object_path:string|null;operation_kind:"upload"|"waive";state:"pending"|"uploaded"|"associated"|"waived"|"superseded";output_digest:string|null};
export interface AvatarRepository{
 claim(user:string,id:string,kind:"upload"|"waive",digest:string|null):Promise<AvatarOperation>;
 upload(user:string,path:string,bytes:Buffer):Promise<void>;
 uploaded(user:string,id:string,digest:string):Promise<void>;
 finish(user:string,id:string):Promise<Receipt>;
 download(user:string):Promise<Buffer>;
}
