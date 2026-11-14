function token(){const data=crypto.getRandomValues(new Uint8Array(32));return btoa(String.fromCharCode(...data)).replaceAll("+","-").replaceAll("/","_").replaceAll("=","");}
export function createAttempt(draft,mode){const {password,...snapshot}=draft;const frozen=structuredClone({...snapshot,name:draft.name.trim(),email:draft.email.trim().toLowerCase(),mode,...(mode==="skip"?{categoryIds:[],productInterests:[],marketing:{...draft.marketing,allowed:false}}:{})});return {id:crypto.randomUUID(),token:token(),snapshot:frozen,credential:password};}
export const attemptBody=a=>({...a.snapshot,password:a.credential});
export const isBound=s=>Boolean(s&&!["processing","unknown","not_created"].includes(s.status));
