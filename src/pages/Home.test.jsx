import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import Home from "./Home";
import { getTopRatedMovies } from "../services/movies";

vi.mock("../services/movies", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, getTopRatedMovies: vi.fn() };
});

const renderHome = () => render(<Home />, { wrapper: MemoryRouter });

describe("Home", () => {
  beforeEach(() => {
    vi.mocked(getTopRatedMovies).mockReset();
  });

  it("shows the skeleton while loading", () => {
    getTopRatedMovies.mockReturnValue(new Promise(() => {}));

    const { container } = renderHome();

    expect(container.querySelectorAll(".movie-card-skeleton").length).toBeGreaterThan(0);
    expect(container.querySelector(".catalog-section")).toHaveAttribute("aria-busy", "true");
  });

  it("renders the loaded movies", async () => {
    getTopRatedMovies.mockResolvedValue([{ id: 1, title: "Matrix", vote_average: 8 }]);

    renderHome();

    expect(await screen.findByRole("heading", { name: "Matrix" })).toBeInTheDocument();
    expect(screen.getByText("1 filmes mais bem avaliados carregados.")).toBeInTheDocument();
  });

  it("shows an empty state when there are no movies", async () => {
    getTopRatedMovies.mockResolvedValue([]);

    renderHome();

    expect(await screen.findByText("Nenhum filme encontrado")).toBeInTheDocument();
  });

  it("shows the error message and retries on demand", async () => {
    getTopRatedMovies
      .mockRejectedValueOnce(new Error("Serviço fora do ar."))
      .mockResolvedValueOnce([{ id: 1, title: "Matrix", vote_average: 8 }]);

    renderHome();

    expect(await screen.findByText("Serviço fora do ar.")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));

    expect(await screen.findByRole("heading", { name: "Matrix" })).toBeInTheDocument();
    expect(getTopRatedMovies).toHaveBeenCalledTimes(2);
  });

  it("ignores aborted requests", async () => {
    const abortError = Object.assign(new Error("aborted"), { name: "AbortError" });
    getTopRatedMovies.mockRejectedValue(abortError);

    const { container } = renderHome();

    await waitFor(() => {
      expect(container.querySelector(".catalog-section")).toHaveAttribute("aria-busy", "true");
    });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("aborts the in-flight request on unmount", async () => {
    let receivedSignal;
    getTopRatedMovies.mockImplementation((signal) => {
      receivedSignal = signal;
      return new Promise(() => {});
    });

    renderHome().unmount();

    expect(receivedSignal.aborted).toBe(true);
  });
});
