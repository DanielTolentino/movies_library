import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "./movies";

const request = (url) => ({ url });

describe("api/movies GET", () => {
  beforeEach(() => {
    process.env.TMDB_API_KEY = "secret-key";
  });

  afterEach(() => {
    delete process.env.TMDB_API_KEY;
  });

  const mockFetch = (response) => {
    const fetchMock = vi.fn().mockResolvedValue(response);
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
  };

  const okResponse = (body) => ({
    ok: true,
    status: 200,
    json: async () => body,
  });

  it("returns 500 when the api key is missing", async () => {
    delete process.env.TMDB_API_KEY;

    const response = await GET(request("https://app.test/api/movies?action=top-rated"));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      message: "O serviço de filmes não está configurado.",
    });
  });

  it("returns 500 when the api key is blank", async () => {
    process.env.TMDB_API_KEY = "   ";

    const response = await GET(request("https://app.test/api/movies?action=top-rated"));

    expect(response.status).toBe(500);
  });

  it("rejects an unknown action", async () => {
    const response = await GET(request("https://app.test/api/movies?action=nope"));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      message: "A ação solicitada é inválida.",
    });
  });

  it("proxies the top rated endpoint with the api key", async () => {
    const fetchMock = mockFetch(okResponse({ results: [{ id: 1 }] }));

    const response = await GET(request("https://app.test/api/movies?action=top-rated"));

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({ results: [{ id: 1 }] });

    const [calledUrl, options] = fetchMock.mock.calls[0];
    expect(calledUrl.toString()).toBe(
      "https://api.themoviedb.org/3/movie/top_rated?api_key=secret-key",
    );
    expect(options.headers).toEqual({ Accept: "application/json" });
    expect(options.signal).toBeInstanceOf(AbortSignal);
  });

  it("forwards the trimmed search query", async () => {
    const fetchMock = mockFetch(okResponse({ results: [] }));

    await GET(request("https://app.test/api/movies?action=search&query=%20matrix%20"));

    expect(fetchMock.mock.calls[0][0].toString()).toBe(
      "https://api.themoviedb.org/3/search/movie?api_key=secret-key&query=matrix",
    );
  });

  it.each([
    ["missing query", "https://app.test/api/movies?action=search"],
    ["blank query", "https://app.test/api/movies?action=search&query=%20%20"],
    [
      "query longer than 100 characters",
      `https://app.test/api/movies?action=search&query=${"a".repeat(101)}`,
    ],
  ])("rejects search with %s", async (_label, url) => {
    const fetchMock = mockFetch(okResponse({}));

    const response = await GET(request(url));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      message: "A busca deve conter entre 1 e 100 caracteres.",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("accepts a search query with exactly 100 characters", async () => {
    const fetchMock = mockFetch(okResponse({ results: [] }));

    const response = await GET(
      request(`https://app.test/api/movies?action=search&query=${"a".repeat(100)}`),
    );

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("requests the details of a valid movie id", async () => {
    const fetchMock = mockFetch(okResponse({ id: 42 }));

    const response = await GET(request("https://app.test/api/movies?action=details&id=42"));

    expect(response.status).toBe(200);
    expect(fetchMock.mock.calls[0][0].toString()).toBe(
      "https://api.themoviedb.org/3/movie/42?api_key=secret-key",
    );
  });

  it.each([
    ["missing", "https://app.test/api/movies?action=details"],
    ["zero prefixed", "https://app.test/api/movies?action=details&id=012"],
    ["non numeric", "https://app.test/api/movies?action=details&id=abc"],
    ["too long", "https://app.test/api/movies?action=details&id=12345678901"],
  ])("rejects a %s movie id", async (_label, url) => {
    const fetchMock = mockFetch(okResponse({}));

    const response = await GET(request(url));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      message: "O identificador do filme é inválido.",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("maps an upstream 404 to a not found message", async () => {
    mockFetch({ ok: false, status: 404, json: async () => ({}) });

    const response = await GET(request("https://app.test/api/movies?action=details&id=7"));

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ message: "Filme não encontrado." });
  });

  it("maps other upstream errors to 502", async () => {
    mockFetch({ ok: false, status: 500, json: async () => ({}) });

    const response = await GET(request("https://app.test/api/movies?action=top-rated"));

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      message: "Não foi possível consultar o serviço de filmes.",
    });
  });

  it("returns 502 when the upstream request throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    const response = await GET(request("https://app.test/api/movies?action=top-rated"));

    expect(response.status).toBe(502);
  });

  it("returns null data when the upstream body is not json", async () => {
    mockFetch({
      ok: true,
      status: 200,
      json: async () => {
        throw new Error("invalid json");
      },
    });

    const response = await GET(request("https://app.test/api/movies?action=top-rated"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toBeNull();
  });

  it("clears the timeout after a successful request", async () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");
    mockFetch(okResponse({ results: [] }));

    await GET(request("https://app.test/api/movies?action=top-rated"));

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it("aborts the upstream request when it exceeds the timeout", async () => {
    vi.useFakeTimers();

    let capturedSignal;
    vi.stubGlobal(
      "fetch",
      vi.fn((_url, options) => {
        capturedSignal = options.signal;
        return new Promise((_resolve, reject) => {
          options.signal.addEventListener("abort", () => reject(new Error("aborted")));
        });
      }),
    );

    const pending = GET(request("https://app.test/api/movies?action=top-rated"));
    await vi.advanceTimersByTimeAsync(8000);
    const response = await pending;

    expect(capturedSignal.aborted).toBe(true);
    expect(response.status).toBe(502);

    vi.useRealTimers();
  });
});
