import type {RequestHandler} from "express";
import {mutation,registrationProof,user,type Services} from "./context.ts";
import {uuid} from "../../../domain/registration/validation.ts";
import {ApiError} from "../errors/api-error.ts";
export function onboardingController(s:Services):{status:RequestHandler;pending:RequestHandler;complete:RequestHandler}{return {
 status:async(req,res)=>{const id=req.params.registrationId;if(!uuid(id))throw new ApiError(401,"REGISTRATION_PROOF_INVALID","A referência do cadastro não é válida.");res.json({data:await s.onboarding.status(id,registrationProof(req))});},
 pending:async(_req,res)=>res.json({data:await s.onboarding.pending(user(res))}),
 complete:async(req,res)=>res.json({data:await s.onboarding.complete(user(res),mutation(req),req.body)})
};}
