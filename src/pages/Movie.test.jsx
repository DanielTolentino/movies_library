import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import Movie from "./Movie";
import { getMovieById } from "../services/movies";

vi.mock("../services/movies", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, getMovieById: vi.fn() };
});

const renderMovie = (id = "42") =>
  render(
    <MemoryRouter initialEntries={[`/movie/${id}`]}>
      <Routes>
        <Route path="/movie/:id" element={<Movie />} />
      </Routes>
    </MemoryRouter>,
  );

const movieFixture = {
  id: 42,
  title: "Matrix",
  tagline: "A realidade é uma escolha",
  vote_average: 8.456,
  budget: 63000000,
  revenue: 463517383,
  runtime: 136,
  overview: "Um hacker descobre a verdade.",
};

describe("Movie", () => {
  beforeEach(() => {
    vi.mocked(getMovieById).mockReset();
  });

  it("shows the loading state and requests the movie from the route param", () => {
    getMovieById.mockReturnValue(new Promise(() => {}));

    renderMovie("7");

    expect(screen.getByRole("status")).toHaveTextContent("Carregando detalhes do filme");
    expect(getMovieById).toHaveBeenCalledWith("7", expect.any(AbortSignal));
  });

  it("renders the movie details with formatted facts", async () => {
    getMovieById.mockResolvedValue(movieFixture);

    renderMovie();

    expect(await screen.findByRole("heading", { name: "Matrix" })).toBeInTheDocument();
    expect(screen.getByText("A realidade é uma escolha")).toBeInTheDocument();
    expect(screen.getByText("8,5")).toBeInTheDocument();
    expect(screen.getByText("Um hacker descobre a verdade.")).toBeInTheDocument();
    expect(screen.getByText("2h 16min")).toBeInTheDocument();
  });

  it.each([
    ["hides missing budget and revenue", { budget: 0, revenue: -1, runtime: 0 }, ["Não informada"]],
    ["formats a whole hour runtime", { runtime: 120 }, ["2h"]],
    ["formats a runtime under an hour", { runtime: 45 }, ["45 min"]],
  ])("%s", async (_label, overrides, expectedTexts) => {
    getMovieById.mockResolvedValue({ ...movieFixture, ...overrides });

    renderMovie();

    await screen.findByRole("heading", { name: "Matrix" });
    expectedTexts.forEach((text) => {
      expect(screen.getByText(text)).toBeInTheDocument();
    });
  });

  it("falls back for a missing title, rating and overview", async () => {
    getMovieById.mockResolvedValue({ id: 42, title: "  ", vote_average: null });

    renderMovie();

    expect(await screen.findByRole("heading", { name: "Filme sem título" })).toBeInTheDocument();
    expect(screen.getByText("—")).toBeInTheDocument();
    expect(
      screen.getByText("Nenhuma sinopse foi informada para este filme."),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Não informado")).toHaveLength(2);
  });

  it("shows the error message and retries on demand", async () => {
    getMovieById
      .mockRejectedValueOnce(new Error("Filme não encontrado."))
      .mockResolvedValueOnce(movieFixture);

    renderMovie();

    expect(await screen.findByText("Filme não encontrado.")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));

    expect(await screen.findByRole("heading", { name: "Matrix" })).toBeInTheDocument();
    expect(getMovieById).toHaveBeenCalledTimes(2);
  });

  it("aborts the in-flight request on unmount", () => {
    let receivedSignal;
    getMovieById.mockImplementation((_id, signal) => {
      receivedSignal = signal;
      return new Promise(() => {});
    });

    renderMovie().unmount();

    expect(receivedSignal.aborted).toBe(true);
  });
});
