import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { MovieGrid, MovieGridSkeleton } from "./MovieGrid";

describe("MovieGrid", () => {
  it("renders one card per movie", () => {
    render(
      <MemoryRouter>
        <MovieGrid
          movies={[
            { id: 1, title: "Matrix", vote_average: 8 },
            { id: 2, title: "Alien", vote_average: 7 },
          ]}
        />
      </MemoryRouter>,
    );

    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByRole("heading", { name: "Matrix" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Alien" })).toBeInTheDocument();
  });

  it("renders an empty list when there are no movies", () => {
    render(
      <MemoryRouter>
        <MovieGrid movies={[]} />
      </MemoryRouter>,
    );

    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });
});

describe("MovieGridSkeleton", () => {
  it("renders eight placeholders by default and is hidden from assistive tech", () => {
    const { container } = render(<MovieGridSkeleton />);

    expect(container.querySelectorAll(".movie-card-skeleton")).toHaveLength(8);
    expect(container.querySelector(".movie-grid")).toHaveAttribute("aria-hidden", "true");
  });

  it("honours a custom count", () => {
    const { container } = render(<MovieGridSkeleton count={3} />);

    expect(container.querySelectorAll(".movie-card-skeleton")).toHaveLength(3);
  });
});
