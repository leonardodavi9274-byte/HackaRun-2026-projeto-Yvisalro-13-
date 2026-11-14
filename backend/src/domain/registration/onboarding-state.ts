import type {Intent,OnboardingState} from "./registration.ts";
export function onboarding(i:Intent|null,authenticated=false,confirmed=false,completedAt?:string|null):OnboardingState{
 const result=(status:string,actions:string[],wait:number|null=null)=>({status,pendingActions:actions,preferredNextAction:actions[0]??null,retryAfterSeconds:wait});
 if(!i)return result("incomplete",["complete_profile"]);
 if(!i.user_id){if(i.identity_state==="not_created")return result("not_created",["correct_data"]);return result(i.identity_state==="in_flight"&&Date.parse(i.lease_expires_at??"")>Date.now()?"processing":"unknown",["check_status"],3);}
 const actions:string[]=[];
 if(!confirmed)actions.push("confirm_email");
 else if(!authenticated)actions.push("authenticate");
 if(i.data_state!=="saved")actions.push("complete_profile");
 if(i.photo_state==="awaiting_upload")actions.push("upload_photo","skip_photo");
 if(!actions.length)return completedAt?result("completed",[]):result("ready_to_complete",["finalize_onboarding"]);
 const status=i.data_state!=="saved"?"incomplete":i.photo_state==="awaiting_upload"?"photo_pending":!confirmed?"awaiting_email_confirmation":"awaiting_authentication";
 return result(status,actions);
}
