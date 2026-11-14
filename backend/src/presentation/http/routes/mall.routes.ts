import {Router} from "express";
import type {Services} from "../controllers/context.ts";
import {mallController} from "../controllers/mall.controller.ts";
export function mallRoutes(s: Services) { const r = Router(); const c = mallController(s); r.get("/", c.get); return r; }
