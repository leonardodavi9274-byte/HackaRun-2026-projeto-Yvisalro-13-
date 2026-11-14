import type {Promotion} from "../../domain/promotions/promotion.ts";
export interface PromotionRepository {
 isActiveMall(mallId:string):Promise<boolean>;
 list(mallId:string):Promise<Promotion[]>;
 find(mallId:string,id:string):Promise<Promotion|null>;
}
