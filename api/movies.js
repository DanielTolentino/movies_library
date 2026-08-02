const TMDB_API_URL = "https://api.themoviedb.org/3";
const REQUEST_TIMEOUT_MS = 8000;
const MAX_QUERY_LENGTH = 100;
const RATE_LIMIT_WINDOW_MS = 60000;
const RATE_LIMIT_MAX_REQUESTS = 60;
const SUCCESS_CACHE_CONTROL = "public, max-age=0, s-maxage=300, stale-while-revalidate=600";

const requestTimestampsByClient = new Map();

const json = (body, status = 200, cacheControl = "no-store") => {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": cacheControl,
    },
  });
};

const isSameOriginRequest = (request) => {
  const site = request.headers.get("sec-fetch-site");

  if (site && site !== "same-origin" && site !== "none") {
    return false;
  }

  const origin = request.headers.get("origin");

  if (!origin) {
    return true;
  }

  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
};

const isRateLimited = (request) => {
  const client =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const now = Date.now();

  for (const [key, timestamps] of requestTimestampsByClient) {
    const recent = timestamps.filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);

    if (recent.length === 0) {
      requestTimestampsByClient.delete(key);
    } else {
      requestTimestampsByClient.set(key, recent);
    }
  }

  const timestamps = requestTimestampsByClient.get(client) ?? [];

  if (timestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  timestamps.push(now);
  requestTimestampsByClient.set(client, timestamps);

  return false;
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

export async function GET(request) {
  if (!isSameOriginRequest(request)) {
    return json({ message: "Origem não autorizada." }, 403);
  }

  if (isRateLimited(request)) {
    return json({ message: "Muitas requisições. Tente novamente em instantes." }, 429);
  }

  const apiKey = process.env.TMDB_API_KEY?.trim();

  if (!apiKey) {
    return json({ message: "O serviço de filmes não está configurado." }, 500);
  }

  const endpoint = getMovieEndpoint(request.url);

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
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const status = response.status === 404 ? 404 : 502;
      const message = status === 404
        ? "Filme não encontrado."
        : "Não foi possível consultar o serviço de filmes.";

      return json({ message }, status);
    }

    return json(data, 200, SUCCESS_CACHE_CONTROL);
  } catch {
    return json({ message: "Não foi possível consultar o serviço de filmes." }, 502);
  } finally {
    clearTimeout(timeout);
  }
}
