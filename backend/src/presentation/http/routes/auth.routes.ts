import {Router} from "express";
import type {Services} from "../controllers/context.ts";
import {registrationController} from "../controllers/registration.controller.ts";
import {identityController} from "../controllers/identity.controller.ts";
import {sessionController} from "../controllers/session.controller.ts";
import {onboardingController} from "../controllers/onboarding.controller.ts";
import {authRateLimit} from "../middlewares/auth-rate-limit.ts";
export function authRoutes(s:Services){const r=Router();const i=identityController(s),c=sessionController(s),o=onboardingController(s);
 r.post("/registrations",authRateLimit("signup"),registrationController(s));r.get("/registrations/:registrationId",o.status);
 r.post("/email/verify",i.verify);r.post("/email/resend",authRateLimit("resend"),i.resend);
 r.post("/sessions",authRateLimit("login"),c.login);r.get("/session",c.current);r.delete("/session",c.logout);return r;
}
