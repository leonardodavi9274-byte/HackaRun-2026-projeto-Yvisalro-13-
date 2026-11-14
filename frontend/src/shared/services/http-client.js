const base=(import.meta.env.VITE_API_BASE_URL||"/api/v1").replace(/\/$/,"");
export class HttpError extends Error {
 constructor(status,payload,retry){super(payload?.message||"Não foi possível acessar o serviço.");this.status=status;this.code=payload?.code;this.fields=payload?.fields||[];this.requestId=payload?.requestId;this.retryAfterSeconds=Number(retry||payload?.retryAfterSeconds)||null;}
}
export async function request(path,{method="GET",body,headers={},signal,binary=false}={}){
 const h={Accept:"application/json",...headers};
 if(!["GET","HEAD"].includes(method))h["X-App-Request"]="web";
 if(body!==undefined&&!binary)h["Content-Type"]="application/json";
 const response=await fetch(base+path,{method,headers:h,body:body===undefined?undefined:binary?body:JSON.stringify(body),signal,credentials:"same-origin",cache:"no-store"});
 const payload=await response.json().catch(()=>null);
 if(!response.ok)throw new HttpError(response.status,payload?.error,response.headers.get("Retry-After"));
 if(!payload||!("data"in payload))throw new HttpError(502,{message:"O serviço retornou uma resposta inesperada."});
 return payload.data;
}
export const getJson=(path,options)=>request(path,options);
export const mutate=(path,method,body,options={})=>request(path,{...options,method,body});
export const upload=(path,file,key,signal)=>request(path,{method:"PUT",body:file,binary:true,signal,headers:{"Content-Type":file.type,"Idempotency-Key":key}});
