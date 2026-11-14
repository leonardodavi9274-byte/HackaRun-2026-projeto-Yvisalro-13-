import type {AvatarRepository} from "../ports/avatar-repository.ts";
import type {ImageProcessor} from "../ports/image-processor.ts";
import type {ConsumerService} from "./consumer.service.ts";
import type {Identity} from "../../domain/registration/registration.ts";
import {digest} from "../../infrastructure/sessions/session-codec.ts";
import {ApiError} from "../../presentation/http/errors/api-error.ts";
export class AvatarService{
 readonly repo:AvatarRepository;readonly images:ImageProcessor;readonly consumers:ConsumerService;
 constructor(repo:AvatarRepository,images:ImageProcessor,consumers:ConsumerService){this.repo=repo;this.images=images;this.consumers=consumers;}
 async save(user:Identity,id:string,bytes:Buffer){const op=await this.repo.claim(user.id,id,"upload",digest(bytes));
 if(["associated","waived","superseded"].includes(op.state))return this.result(user,await this.repo.finish(user.id,id));
 if(!op.object_path)throw new ApiError(503,"PHOTO_SAVE_FAILED","Não foi possível preparar a foto.");
 const output=await this.images.process(bytes);await this.repo.upload(user.id,op.object_path,output);await this.repo.uploaded(user.id,id,digest(output));return this.result(user,await this.repo.finish(user.id,id));}
 async waive(user:Identity,id:string){await this.repo.claim(user.id,id,"waive",null);return this.result(user,await this.repo.finish(user.id,id));}
 async result(user:Identity,receipt:unknown){const profile=await this.consumers.get(user);return {photo:profile.photo,onboarding:profile.onboarding,receipt};}
 download(user:Identity){return this.repo.download(user.id);}
}
