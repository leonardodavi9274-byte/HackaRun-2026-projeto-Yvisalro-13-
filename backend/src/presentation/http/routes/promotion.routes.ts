import {Router} from "express";
import type {Services} from "../controllers/context.ts";
import {promotionController} from "../controllers/promotion.controller.ts";
export function promotionRoutes(s:Services){const r=Router(),c=promotionController(s);r.get("/",c.list);r.get("/:id",c.confirm);return r;}
