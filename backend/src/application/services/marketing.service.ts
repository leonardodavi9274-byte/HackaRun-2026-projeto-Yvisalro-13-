import type {MarketingRepository} from "../ports/marketing-repository.ts";
import {marketingPreference} from "../../domain/preferences/marketing-preference.ts";
export class MarketingService{readonly repo:MarketingRepository;constructor(repo:MarketingRepository){this.repo=repo;}set(userId:string,id:string,body:unknown){const v=marketingPreference(body);return this.repo.set(userId,id,v.allowed,v.noticeVersion);}}
