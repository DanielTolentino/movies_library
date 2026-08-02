const TMDB_API_URL = "https://api.themoviedb.org";
const REQUEST_TIMEOUT_MS = 8000;
const MAX_QUERY_LENGTH = 100;
const MAX_PAGE = 500;
const LANGUAGE = "pt-BR";
const REGION = "BR";
const LIST_CACHE_CONTROL = "public, max-age=0, s-maxage=300, stale-while-revalidate=600";

const json = (body, status = 200, headers = {}) => {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...headers,
    },
  });
};

const getPage = (url) => {
  const rawPage = url.searchParams.get("page");

  if (rawPage === null || rawPage === "") return 1;
  if (!/^[1-9]\d{0,2}$/.test(rawPage)) return null;

  const page = Number(rawPage);

  return page <= MAX_PAGE ? page : null;
};

const getMovieEndpoint = (requestUrl) => {
  const url = new URL(requestUrl);
  const action = url.searchParams.get("action");

  if (action === "top-rated" || action === "search") {
    const page = getPage(url);

    if (page === null) {
      return { error: "A página solicitada é inválida." };
    }

    if (action === "top-rated") {
      return {
        path: "/3/movie/top_rated",
        params: { page, region: REGION },
        cacheable: true,
      };
    }

    const query = url.searchParams.get("query")?.trim() ?? "";

    if (!query || query.length > MAX_QUERY_LENGTH) {
      return { error: "A busca deve conter entre 1 e 100 caracteres." };
    }

    return {
      path: "/3/search/movie",
      params: { page, query, include_adult: "false" },
      cacheable: true,
    };
  }

  if (action === "details") {
    const id = url.searchParams.get("id") ?? "";

    if (!/^[1-9]\d{0,9}$/.test(id)) {
      return { error: "O identificador do filme é inválido." };
    }

    return { path: `/3/movie/${id}`, params: {}, cacheable: true };
  }

  return { error: "A ação solicitada é inválida." };
};

export async function GET(request) {
  const apiKey = process.env.TMDB_API_KEY?.trim();

  if (!apiKey) {
    return json({ message: "O serviço de filmes não está configurado." }, 500);
  }

  const endpoint = getMovieEndpoint(request.url);

  if (endpoint.error) {
    return json({ message: endpoint.error }, 400);
  }

  const tmdbUrl = new URL(endpoint.path, TMDB_API_URL);
  tmdbUrl.searchParams.set("api_key", apiKey);
  tmdbUrl.searchParams.set("language", LANGUAGE);

  Object.entries(endpoint.params).forEach(([key, value]) => {
    tmdbUrl.searchParams.set(key, String(value));
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(tmdbUrl, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      console.error("TMDB request failed", {
        path: endpoint.path,
        status: response.status,
      });

      if (response.status === 404) {
        return json({ message: "Filme não encontrado." }, 404);
      }

      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After");

        return json(
          { message: "Muitas requisições. Tente novamente em instantes." },
          429,
          retryAfter ? { "Retry-After": retryAfter } : {},
        );
      }

      return json({ message: "Não foi possível consultar o serviço de filmes." }, 502);
    }

    return json(data, 200, endpoint.cacheable ? { "Cache-Control": LIST_CACHE_CONTROL } : {});
  } catch (error) {
    console.error("TMDB request errored", { path: endpoint.path, error });

    return json({ message: "Não foi possível consultar o serviço de filmes." }, 502);
  } finally {
    clearTimeout(timeout);
  }
}
