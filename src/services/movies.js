const API_ENDPOINT = "/api/movies";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500/";

const requestMovies = async (action, params = {}, signal) => {
  const searchParams = new URLSearchParams({ action });

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.set(key, String(value));
    }
  });

  const response = await fetch(`${API_ENDPOINT}?${searchParams}`, {
    headers: { Accept: "application/json" },
    signal,
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message ?? "Não foi possível carregar os filmes.");
  }

  return data;
};

const toMovieList = (data) => {
  if (!Array.isArray(data?.results)) {
    throw new Error("Não foi possível carregar os filmes.");
  }

  return data.results;
};

export const getTopRatedMovies = async (signal) =>
  toMovieList(await requestMovies("top-rated", {}, signal));

export const searchMovies = async (query, signal) =>
  toMovieList(await requestMovies("search", { query }, signal));

export const getMovieById = async (id, signal) => {
  const data = await requestMovies("details", { id }, signal);

  if (!data || typeof data !== "object" || Array.isArray(data) || !data.id) {
    throw new Error("Não foi possível carregar os detalhes do filme.");
  }

  return data;
};

export const getMovieImageUrl = (posterPath) => {
  return posterPath ? `${IMAGE_BASE_URL}${posterPath}` : null;
};
