import { useCallback, useEffect, useState } from "react";
import { systemRepository } from "../repositories/system.repository.js";

export function useHomeViewModel() {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState({
    status: "loading",
    data: null,
    error: null,
  });
  useEffect(() => {
    const controller = new AbortController();
    setState({ status: "loading", data: null, error: null });
    systemRepository
      .getStatus({ signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted)
          setState({ status: "ready", data, error: null });
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setState({
            status: "error",
            data: null,
            error: "Não foi possível conectar ao serviço. Tente novamente.",
          });
        }
      });
    return () => controller.abort();
  }, [attempt]);

  const retry = useCallback(() => setAttempt((value) => value + 1), []);
  return { ...state, retry };
}


export function useAccountHomeViewModel(){
 const [profile,setProfile]=useState(null),[categories,setCategories]=useState([]),[accountError,setAccountError]=useState(null),[categoryError,setCategoryError]=useState(null);
 const reloadAccount=useCallback(async()=>{
  const {registrationRepository:r}=await import("../../registration/repositories/registration.repository.js");
  const results=await Promise.allSettled([r.profile(),r.categories()]);
  if(results[0].status==="fulfilled"){setProfile(results[0].value);setAccountError(null);}else setAccountError(results[0].reason);
  if(results[1].status==="fulfilled"){setCategories(results[1].value.categories);setCategoryError(null);}else setCategoryError(results[1].reason);
 },[]);
 useEffect(()=>{reloadAccount();},[reloadAccount]);
 return {profile,categories,accountError,categoryError,reloadAccount};
}
