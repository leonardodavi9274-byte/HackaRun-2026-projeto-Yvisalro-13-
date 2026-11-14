import type {AvatarService} from "../../../application/services/avatar.service.ts";
import type {MarketingService} from "../../../application/services/marketing.service.ts";
import type {Response,Request} from "express";
import {ApiError} from "../errors/api-error.ts";
import {uuid} from "../../../domain/registration/validation.ts";
import type {Identity} from "../../../domain/registration/registration.ts";
import type {RegistrationService} from "../../../application/services/registration.service.ts";
import type {IdentityService} from "../../../application/services/identity.service.ts";
import type {SessionService} from "../../../application/services/session.service.ts";
import type {ConsumerService} from "../../../application/services/consumer.service.ts";
import type {OnboardingService} from "../../../application/services/onboarding.service.ts";
import type {WebSessionService} from "../../../application/services/web-session.service.ts";
import type {RegistrationConfigService} from "../../../application/services/registration-config.service.ts";
import type {RegistrationOptionsRepository} from "../../../infrastructure/supabase/registration-options.repository.ts";
import type {MallService} from "../../../application/services/mall.service.ts";
import type {PromotionService} from "../../../application/services/promotion.service.ts";
import type {CatalogReferenceService} from "../../../application/services/catalog-reference.service.ts";
import type {CatalogSearchService} from "../../../application/services/catalog-search.service.ts";
import type {CatalogSimilarService} from "../../../application/services/catalog-similar.service.ts";
import type {CatalogComparisonService} from "../../../application/services/catalog-comparison.service.ts";
export type Services={catalog:CatalogReferenceService;catalogSearch:CatalogSearchService;catalogSimilar:CatalogSimilarService;catalogComparison:CatalogComparisonService;mall:MallService;promotions:PromotionService;avatars:AvatarService;marketing:MarketingService;registrations:RegistrationService;identity:IdentityService;sessions:SessionService;consumers:ConsumerService;onboarding:OnboardingService;webSessions:WebSessionService;config:RegistrationConfigService;options:RegistrationOptionsRepository};
export const user=(res:Response)=>res.locals.user as Identity;
export function mutation(req:Request){const id=req.get("Idempotency-Key");if(!uuid(id))throw new ApiError(400,"INVALID_OPERATION_KEY","A operação precisa de uma chave válida.");return id.toLowerCase();}
export function registrationProof(req:Request){const token=req.get("Registration-Token");if(!token||!/^[A-Za-z0-9_-]{43}$/.test(token))throw new ApiError(401,"REGISTRATION_PROOF_INVALID","A referência do cadastro não é válida.");return token;}
