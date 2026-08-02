import { describe, expect, it, vi } from "vitest";

import {
  getMovieById,
  getMovieImageUrl,
  getTopRatedMovies,
  searchMovies,
} from "./movies";

const mockFetch = (response) => {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
};

const okResponse = (body) => ({ ok: true, status: 200, json: async () => body });

describe("getTopRatedMovies", () => {
  it("requests the top rated action and returns the results", async () => {
    const fetchMock = mockFetch(okResponse({ results: [{ id: 1 }] }));
    const signal = new AbortController().signal;

    await expect(getTopRatedMovies(signal)).resolves.toEqual([{ id: 1 }]);
    expect(fetchMock).toHaveBeenCalledWith("/api/movies?action=top-rated", {
      headers: { Accept: "application/json" },
      signal,
    });
  });

  it("throws the api message when the response fails", async () => {
    mockFetch({ ok: false, status: 502, json: async () => ({ message: "Serviço fora do ar." }) });

    await expect(getTopRatedMovies()).rejects.toThrow("Serviço fora do ar.");
  });

  it("throws a default message when the error body has no message", async () => {
    mockFetch({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error("invalid json");
      },
    });

    await expect(getTopRatedMovies()).rejects.toThrow("Não foi possível carregar os filmes.");
  });

  it("throws when results are not an array", async () => {
    mockFetch(okResponse({ results: "nope" }));

    await expect(getTopRatedMovies()).rejects.toThrow("Não foi possível carregar os filmes.");
  });
});

describe("searchMovies", () => {
  it("encodes the query in the request", async () => {
    const fetchMock = mockFetch(okResponse({ results: [] }));

    await expect(searchMovies("the matrix")).resolves.toEqual([]);
    expect(fetchMock.mock.calls[0][0]).toBe("/api/movies?action=search&query=the+matrix");
  });

  it("omits null and undefined params", async () => {
    const fetchMock = mockFetch(okResponse({ results: [] }));

    await searchMovies(undefined);

    expect(fetchMock.mock.calls[0][0]).toBe("/api/movies?action=search");
  });

  it("throws when the payload has no results array", async () => {
    mockFetch(okResponse({}));

    await expect(searchMovies("matrix")).rejects.toThrow("Não foi possível carregar os filmes.");
  });
});

describe("getMovieById", () => {
  it("returns the movie payload", async () => {
    const fetchMock = mockFetch(okResponse({ id: 42, title: "Matrix" }));

    await expect(getMovieById(42)).resolves.toEqual({ id: 42, title: "Matrix" });
    expect(fetchMock.mock.calls[0][0]).toBe("/api/movies?action=details&id=42");
  });

  it.each([
    ["null", null],
    ["a list", [{ id: 1 }]],
    ["an object without id", { title: "Matrix" }],
  ])("throws when the payload is %s", async (_label, payload) => {
    mockFetch(okResponse(payload));

    await expect(getMovieById(42)).rejects.toThrow(
      "Não foi possível carregar os detalhes do filme.",
    );
  });
});

describe("getMovieImageUrl", () => {
  it("builds the full image url", () => {
    expect(getMovieImageUrl("/poster.jpg")).toBe(
      "https://image.tmdb.org/t/p/w500//poster.jpg",
    );
  });

  it.each([null, undefined, ""])("returns null for %s", (value) => {
    expect(getMovieImageUrl(value)).toBeNull();
  });
});
