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

export const getTopRatedMovies = async (signal) => {
  const data = await requestMovies("top-rated", {}, signal);

  if (!Array.isArray(data?.results)) {
    throw new Error("Não foi possível carregar os filmes.");
  }

  return data.results;
};

export const searchMovies = async (query, signal) => {
  const data = await requestMovies("search", { query }, signal);

  if (!Array.isArray(data?.results)) {
    throw new Error("Não foi possível carregar os filmes.");
  }

  return data.results;
};

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
