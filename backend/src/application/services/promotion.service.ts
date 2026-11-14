import type {PromotionRepository} from "../ports/promotion-repository.ts";
import {isEligiblePromotion,publicPromotion} from "../../domain/promotions/promotion.ts";
import {ApiError} from "../../presentation/http/errors/api-error.ts";
const unavailable=()=>new ApiError(503,"PROMOTIONS_UNAVAILABLE","As promoções estão indisponíveis no momento.");
const validId=(value:string)=>/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && value.length<=120;
export class PromotionService {
 readonly repo:PromotionRepository;
 constructor(repo:PromotionRepository){this.repo=repo;}
 private async active(mallId:string){if(!validId(mallId))throw new ApiError(400,"INVALID_MALL","Shopping inválido.");let active;try{active=await this.repo.isActiveMall(mallId);}catch{throw unavailable();}if(!active)throw new ApiError(404,"MALL_NOT_ACTIVE","Shopping indisponível.");}
 async list(mallId:string){await this.active(mallId);try{return {mallId,offers:(await this.repo.list(mallId)).filter(p=>isEligiblePromotion(p)).map(publicPromotion)};}catch{throw unavailable();}}
 async confirm(mallId:string,id:string,revision:number){
  if(!validId(id)||!Number.isSafeInteger(revision)||revision<1||!validId(mallId))throw new ApiError(400,"INVALID_PROMOTION_REQUEST","Dados da promoção inválidos.");
  await this.active(mallId);let offer;try{offer=await this.repo.find(mallId,id);}catch{throw unavailable();}
  if(!offer||!isEligiblePromotion(offer))throw new ApiError(404,"OFFER_NOT_ELIGIBLE","Promoção indisponível.");
  if(offer.revision!==revision)throw new ApiError(409,"OFFER_CHANGED","A promoção foi alterada.");
  return {offer:publicPromotion(offer)};
 }
}
