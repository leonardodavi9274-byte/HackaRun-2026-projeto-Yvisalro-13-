import {Router} from "express";
import type {Services} from "../controllers/context.ts";
import {catalogController} from "../controllers/catalog.controller.ts";
export function catalogRoutes(services:Services){
 const router=Router(),c=catalogController(services);
 router.get("/categories",c.categories);
 router.get("/products/:id",c.product);
 router.get("/offers",c.search);
 router.get("/offers/:id",c.offer);
 router.get("/variants/:id/similar",c.similar);
 router.get("/variants/:id",c.variant);
 return router;
}
