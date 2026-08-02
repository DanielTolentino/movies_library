import { useCallback, useEffect, useState } from "react";

const mergeMovies = (current, incoming) => {
  const seen = new Set(current.map((movie) => movie.id));

  return [...current, ...incoming.filter((movie) => !seen.has(movie.id))];
};

const initialState = {
  movies: [],
  page: 0,
  totalPages: 0,
  status: "loading",
  errorMessage: "",
};

/**
 * Loads a paginated movie list, appending further pages to the ones already
 * loaded. `fetchPage` must be stable and receive `(page, signal)`.
 */
export const useMovieList = (fetchPage, { enabled = true } = {}) => {
  const [state, setState] = useState(() =>
    enabled ? initialState : { ...initialState, status: "idle" },
  );
  const [request, setRequest] = useState({ page: 1, version: 0 });

  useEffect(() => {
    setState(enabled ? initialState : { ...initialState, status: "idle" });
    setRequest((current) =>
      current.page === 1 ? current : { page: 1, version: current.version },
    );
  }, [enabled, fetchPage]);

  useEffect(() => {
    if (!enabled) return undefined;

    const controller = new AbortController();
    let isCurrentRequest = true;

    setState((current) => ({
      ...current,
      status: request.page === 1 ? "loading" : "loading-more",
      errorMessage: "",
    }));

    fetchPage(request.page, controller.signal)
      .then(({ results, page, totalPages }) => {
        if (!isCurrentRequest) return;

        setState((current) => ({
          movies: page > 1 ? mergeMovies(current.movies, results) : results,
          page,
          totalPages,
          status: "success",
          errorMessage: "",
        }));
      })
      .catch((error) => {
        if (!isCurrentRequest || error?.name === "AbortError") return;

        setState((current) => ({
          ...current,
          status: "error",
          errorMessage: error?.message ?? "Não foi possível carregar os filmes.",
        }));
      });

    return () => {
      isCurrentRequest = false;
      controller.abort();
    };
  }, [enabled, fetchPage, request]);

  const retry = useCallback(() => {
    setRequest((current) => ({ ...current, version: current.version + 1 }));
  }, []);

  const loadMore = useCallback(() => {
    setRequest((current) => ({ page: current.page + 1, version: current.version }));
  }, []);

  return {
    ...state,
    hasMore: state.page > 0 && state.page < state.totalPages,
    retry,
    loadMore,
  };
};
