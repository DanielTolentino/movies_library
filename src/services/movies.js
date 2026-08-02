const API_ENDPOINT = "/api/movies";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500/";

export const MAX_QUERY_LENGTH = 100;

class MovieServiceError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "MovieServiceError";
    this.status = status;
  }
}

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
    throw new MovieServiceError(
      data?.message ?? "Não foi possível carregar os filmes.",
      response.status,
    );
  }

  return data;
};

const toMoviePage = (data) => {
  if (!Array.isArray(data?.results)) {
    throw new MovieServiceError("Não foi possível carregar os filmes.");
  }

  const page = Number.isFinite(data.page) ? data.page : 1;
  const totalPages = Number.isFinite(data.total_pages) ? data.total_pages : page;

  return { results: data.results, page, totalPages };
};

export const getTopRatedMovies = async (page = 1, signal) => {
  return toMoviePage(await requestMovies("top-rated", { page }, signal));
};

export const searchMovies = async (query, page = 1, signal) => {
  return toMoviePage(await requestMovies("search", { query, page }, signal));
};

export const getMovieById = async (id, signal) => {
  const data = await requestMovies("details", { id }, signal);

  if (!data || typeof data !== "object" || Array.isArray(data) || !data.id) {
    throw new MovieServiceError("Não foi possível carregar os detalhes do filme.");
  }

  return data;
};

export const getMovieImageUrl = (posterPath) => {
  return posterPath ? `${IMAGE_BASE_URL}${posterPath}` : null;
};
