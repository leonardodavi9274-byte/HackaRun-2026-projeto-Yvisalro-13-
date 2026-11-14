import {Router} from "express";
import type {HealthController} from "../controllers/health.controller.ts";
import type {Services} from "../controllers/context.ts";
import {registrationRoutes} from "./registration.routes.ts";
import {authRoutes} from "./auth.routes.ts";
import {meRoutes} from "./me.routes.ts";
import {homeRoutes} from "./home.routes.ts";
import {mallRoutes} from "./mall.routes.ts";
import {promotionRoutes} from "./promotion.routes.ts";
export function createApiRoutes(health:HealthController,services:Services){const router=Router();router.get("/",(_req,res)=>res.json({data:{name:"Hackarum-Yvisalro WebAPI",version:"v1",health:"/api/v1/health"}}));router.get("/health",health.get);router.use(homeRoutes(services.home));router.use(registrationRoutes(services));router.use("/auth",authRoutes(services));router.use("/me",meRoutes(services));router.use("/mall",mallRoutes(services));router.use("/promotions",promotionRoutes(services));return router;}
