import { useCallback, useEffect, useState } from "react";

const DEFAULT_ERROR_MESSAGE = "Não foi possível carregar os filmes.";

export const useAsyncData = (
  fetcher,
  dependencies = [],
  { enabled = true, initialData = null, errorMessage: fallbackMessage = DEFAULT_ERROR_MESSAGE } = {},
) => {
  const [data, setData] = useState(initialData);
  const [status, setStatus] = useState(enabled ? "loading" : "idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [requestVersion, setRequestVersion] = useState(0);

  const retry = useCallback(() => {
    setRequestVersion((version) => version + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let isCurrentRequest = true;

    setData(initialData);
    setErrorMessage("");

    if (!enabled) {
      setStatus("idle");
      return () => {
        isCurrentRequest = false;
        controller.abort();
      };
    }

    setStatus("loading");

    fetcher(controller.signal)
      .then((result) => {
        if (!isCurrentRequest) return;

        setData(result);
        setStatus("success");
      })
      .catch((error) => {
        if (!isCurrentRequest || error?.name === "AbortError") return;

        setErrorMessage(error?.message ?? fallbackMessage);
        setStatus("error");
      });

    return () => {
      isCurrentRequest = false;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies, enabled, requestVersion]);

  return { data, status, errorMessage, retry };
};
