import {createContext,useContext,useRef} from "react";
import {usePath} from "../../../app/navigation.js";
const Context=createContext(null);
export function PromotionSessionProvider({children}){
 const session=useRef({ownerId:null,dismissed:new Set(),path:null,visit:0,shown:false});
 const path=usePath();
 if(session.current.path!==path){session.current.path=path;if(path==="/inicio"){session.current.visit++;session.current.shown=false;}}
 return <Context.Provider value={session}>{children}</Context.Provider>;
}
export function usePromotionSession(ownerId){
 const session=useContext(Context);
 if(!session)throw new Error("PromotionSessionProvider ausente");
 if(session.current.ownerId!==ownerId)session.current={ownerId,dismissed:new Set(),path:session.current.path,visit:session.current.visit,shown:false};
 return session.current;
}
