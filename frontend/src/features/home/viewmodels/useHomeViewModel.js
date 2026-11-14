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
