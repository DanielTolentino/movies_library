const TMDB_API_URL = "https://api.themoviedb.org/3";
const REQUEST_TIMEOUT_MS = 8000;
const MAX_QUERY_LENGTH = 100;

const json = (body, status = 200) => {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
};

const getMovieEndpoint = (requestUrl) => {
  const url = new URL(requestUrl);
  const action = url.searchParams.get("action");

  if (action === "top-rated") {
    return { path: "/3/movie/top_rated" };
  }

  if (action === "search") {
    const query = url.searchParams.get("query")?.trim() ?? "";

    if (!query || query.length > MAX_QUERY_LENGTH) {
      return { error: "A busca deve conter entre 1 e 100 caracteres." };
    }

    return { path: "/3/search/movie", query };
  }

  if (action === "details") {
    const id = url.searchParams.get("id") ?? "";

    if (!/^[1-9]\d{0,9}$/.test(id)) {
      return { error: "O identificador do filme é inválido." };
    }

    return { path: `/3/movie/${id}` };
  }

  return { error: "A ação solicitada é inválida." };
};

const UPSTREAM_ERROR_MESSAGE = "Não foi possível consultar o serviço de filmes.";

export async function GET(request) {
  const apiKey = process.env.TMDB_API_KEY?.trim();

  if (!apiKey) {
    console.error("[api/movies] TMDB_API_KEY ausente ou vazia.");

    return json({ message: "O serviço de filmes não está configurado." }, 500);
  }

  let endpoint;

  try {
    endpoint = getMovieEndpoint(request.url);
  } catch (error) {
    console.error("[api/movies] URL da requisição inválida.", error);

    return json({ message: "A requisição é inválida." }, 400);
  }

  if (endpoint.error) {
    return json({ message: endpoint.error }, 400);
  }

  const tmdbUrl = new URL(TMDB_API_URL);
  tmdbUrl.pathname = endpoint.path;
  tmdbUrl.searchParams.set("api_key", apiKey);

  if (endpoint.query) {
    tmdbUrl.searchParams.set("query", endpoint.query);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(tmdbUrl, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });

    if (!response.ok) {
      console.error(
        `[api/movies] TMDB respondeu ${response.status} para ${endpoint.path}.`,
      );

      if (response.status === 404) {
        return json({ message: "Filme não encontrado." }, 404);
      }

      return json({ message: UPSTREAM_ERROR_MESSAGE }, 502);
    }

    let data;

    try {
      data = await response.json();
    } catch (error) {
      console.error("[api/movies] Resposta do TMDB não é um JSON válido.", error);

      return json({ message: UPSTREAM_ERROR_MESSAGE }, 502);
    }

    return json(data);
  } catch (error) {
    if (error?.name === "AbortError") {
      console.error(
        `[api/movies] TMDB excedeu o tempo limite de ${REQUEST_TIMEOUT_MS}ms para ${endpoint.path}.`,
      );

      return json({ message: "O serviço de filmes demorou para responder." }, 504);
    }

    console.error(`[api/movies] Falha ao consultar o TMDB para ${endpoint.path}.`, error);

    return json({ message: UPSTREAM_ERROR_MESSAGE }, 502);
  } finally {
    clearTimeout(timeout);
  }
}
