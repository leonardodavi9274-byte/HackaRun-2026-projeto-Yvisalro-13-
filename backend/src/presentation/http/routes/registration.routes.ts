import {Router} from "express";
import type {Services} from "../controllers/context.ts";
import {registrationOptionsController} from "../controllers/registration-options.controller.ts";
export function registrationRoutes(s:Services){const r=Router();const c=registrationOptionsController(s);r.get("/registration-config",c.config);r.get("/interest-categories",c.categories);return r;}
