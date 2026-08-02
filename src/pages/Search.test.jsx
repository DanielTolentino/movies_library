import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import Search from "./Search";
import { searchMovies } from "../services/movies";

vi.mock("../services/movies", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, searchMovies: vi.fn() };
});

const renderSearch = (entry = "/search?q=matrix") =>
  render(
    <MemoryRouter initialEntries={[entry]}>
      <Search />
    </MemoryRouter>,
  );

describe("Search", () => {
  beforeEach(() => {
    vi.mocked(searchMovies).mockReset();
  });

  it("prompts for a query when none is provided", () => {
    renderSearch("/search");

    expect(screen.getByText("Comece uma busca")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Encontre seu próximo filme" })).toBeInTheDocument();
    expect(searchMovies).not.toHaveBeenCalled();
  });

  it("treats a whitespace-only query as empty", () => {
    renderSearch("/search?q=%20%20");

    expect(screen.getByText("Comece uma busca")).toBeInTheDocument();
    expect(searchMovies).not.toHaveBeenCalled();
  });

  it("shows the skeleton while the search is running", () => {
    searchMovies.mockReturnValue(new Promise(() => {}));

    const { container } = renderSearch();

    expect(container.querySelectorAll(".movie-card-skeleton").length).toBeGreaterThan(0);
    expect(searchMovies).toHaveBeenCalledWith("matrix", expect.any(AbortSignal));
  });

  it("renders the results for the query", async () => {
    searchMovies.mockResolvedValue([{ id: 1, title: "Matrix", vote_average: 8 }]);

    renderSearch();

    expect(await screen.findByRole("heading", { name: "Matrix" })).toBeInTheDocument();
    expect(screen.getByText("1 resultados encontrados para matrix.")).toBeInTheDocument();
  });

  it("shows an empty state when nothing is found", async () => {
    searchMovies.mockResolvedValue([]);

    renderSearch();

    expect(await screen.findByText("Nenhum filme encontrado")).toBeInTheDocument();
  });

  it("shows the error message and retries on demand", async () => {
    searchMovies
      .mockRejectedValueOnce(new Error("Falha na busca."))
      .mockResolvedValueOnce([{ id: 1, title: "Matrix", vote_average: 8 }]);

    renderSearch();

    expect(await screen.findByText("Falha na busca.")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));

    expect(await screen.findByRole("heading", { name: "Matrix" })).toBeInTheDocument();
    expect(searchMovies).toHaveBeenCalledTimes(2);
  });

  it("aborts the in-flight request on unmount", () => {
    let receivedSignal;
    searchMovies.mockImplementation((_query, signal) => {
      receivedSignal = signal;
      return new Promise(() => {});
    });

    renderSearch().unmount();

    expect(receivedSignal.aborted).toBe(true);
  });
});
