const API_ENDPOINT = "/api/movies";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500/";
const REQUEST_TIMEOUT_MS = 10000;
const GENERIC_ERROR_MESSAGE = "Não foi possível carregar os filmes.";
const NETWORK_ERROR_MESSAGE =
  "Não foi possível conectar ao serviço de filmes. Verifique sua conexão.";
const TIMEOUT_ERROR_MESSAGE = "O serviço de filmes demorou para responder.";

export class MoviesApiError extends Error {
  constructor(message, options = {}) {
    super(message, { cause: options.cause });
    this.name = "MoviesApiError";
    this.status = options.status ?? null;
  }
}

const createRequestSignal = (signal) => {
  const timeoutSignal = AbortSignal.timeout(REQUEST_TIMEOUT_MS);

  if (!signal) return timeoutSignal;
  if (typeof AbortSignal.any !== "function") return signal;

  return AbortSignal.any([signal, timeoutSignal]);
};

const requestMovies = async (action, params = {}, signal) => {
  const searchParams = new URLSearchParams({ action });

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.set(key, String(value));
    }
  });

  let response;

  try {
    response = await fetch(`${API_ENDPOINT}?${searchParams}`, {
      headers: { Accept: "application/json" },
      signal: createRequestSignal(signal),
    });
  } catch (error) {
    if (signal?.aborted) throw error;

    if (error?.name === "TimeoutError") {
      throw new MoviesApiError(TIMEOUT_ERROR_MESSAGE, { cause: error });
    }

    throw new MoviesApiError(NETWORK_ERROR_MESSAGE, { cause: error });
  }

  let data = null;
  let parseError = null;

  try {
    data = await response.json();
  } catch (error) {
    if (signal?.aborted) throw error;

    parseError = error;
  }

  if (!response.ok) {
    throw new MoviesApiError(data?.message ?? GENERIC_ERROR_MESSAGE, {
      status: response.status,
      cause: parseError,
    });
  }

  if (parseError) {
    throw new MoviesApiError(GENERIC_ERROR_MESSAGE, {
      status: response.status,
      cause: parseError,
    });
  }

  return data;
};

export const getTopRatedMovies = async (signal) => {
  const data = await requestMovies("top-rated", {}, signal);

  if (!Array.isArray(data?.results)) {
    throw new MoviesApiError(GENERIC_ERROR_MESSAGE);
  }

  return data.results;
};

export const searchMovies = async (query, signal) => {
  const data = await requestMovies("search", { query }, signal);

  if (!Array.isArray(data?.results)) {
    throw new MoviesApiError(GENERIC_ERROR_MESSAGE);
  }

  return data.results;
};

export const getMovieById = async (id, signal) => {
  const data = await requestMovies("details", { id }, signal);

  if (!data || typeof data !== "object" || Array.isArray(data) || !data.id) {
    throw new MoviesApiError("Não foi possível carregar os detalhes do filme.");
  }

  return data;
};

export const getMovieImageUrl = (posterPath) => {
  return posterPath ? `${IMAGE_BASE_URL}${posterPath}` : null;
};
