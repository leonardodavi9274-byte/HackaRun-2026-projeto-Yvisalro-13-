import {raw} from "express";
import {avatarController,checkPhoto} from "../controllers/avatar.controller.ts";
import {marketingController} from "../controllers/marketing.controller.ts";
import {Router} from "express";
import type {Services} from "../controllers/context.ts";
import {consumerController} from "../controllers/consumer.controller.ts";
import {onboardingController} from "../controllers/onboarding.controller.ts";
import {requireAuth} from "../middlewares/require-auth.ts";
export function meRoutes(s:Services){const r=Router();r.use(requireAuth(s.webSessions));const o=onboardingController(s),a=avatarController(s);r.put("/onboarding/avatar",checkPhoto,raw({type:["image/jpeg","image/png","image/webp"],limit:5242880,inflate:false}),a.save);r.delete("/onboarding/avatar",a.waive);r.get("/avatar",a.download);r.patch("/marketing-preference",marketingController(s));r.get("/",consumerController(s));r.get("/onboarding",o.pending);r.post("/onboarding/complete",o.complete);return r;}
