import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import MovieCard, { MoviePoster } from "./MovieCard";

const renderWithRouter = (ui) => render(ui, { wrapper: MemoryRouter });

describe("MoviePoster", () => {
  it("renders the poster image when a path is available", () => {
    render(<MoviePoster movie={{ id: 1, title: "Matrix", poster_path: "/p.jpg" }} />);

    const image = screen.getByRole("img", { name: "Pôster de Matrix" });
    expect(image).toHaveAttribute("src", "https://image.tmdb.org/t/p/w500//p.jpg");
    expect(image).toHaveAttribute("loading", "lazy");
  });

  it("accepts a custom loading strategy and class name", () => {
    render(
      <MoviePoster
        movie={{ id: 1, title: "Matrix", poster_path: "/p.jpg" }}
        loading="eager"
        className="movie-detail__poster"
      />,
    );

    expect(screen.getByRole("img", { name: "Pôster de Matrix" })).toHaveAttribute(
      "loading",
      "eager",
    );
    expect(document.querySelector(".movie-poster")).toHaveClass("movie-detail__poster");
  });

  it("renders a placeholder when there is no poster path", () => {
    render(<MoviePoster movie={{ id: 1, title: "Matrix" }} />);

    expect(screen.getByRole("img", { name: "Pôster de Matrix indisponível" })).toHaveClass(
      "movie-poster--placeholder",
    );
  });

  it("falls back to a placeholder when the image fails to load", () => {
    render(<MoviePoster movie={{ id: 1, title: "Matrix", poster_path: "/p.jpg" }} />);

    fireEvent.error(screen.getByRole("img", { name: "Pôster de Matrix" }));

    expect(screen.getByRole("img", { name: "Pôster de Matrix indisponível" })).toBeInTheDocument();
  });

  it("uses a fallback title when the movie title is blank", () => {
    render(<MoviePoster movie={{ id: 1, title: "   " }} />);

    expect(
      screen.getByRole("img", { name: "Pôster de Filme sem título indisponível" }),
    ).toBeInTheDocument();
  });
});

describe("MovieCard", () => {
  it("links to the movie details and shows the formatted rating", () => {
    renderWithRouter(
      <MovieCard movie={{ id: 7, title: "Matrix", vote_average: 8.456, poster_path: "/p.jpg" }} />,
    );

    expect(screen.getByRole("link")).toHaveAttribute("href", "/movie/7");
    expect(screen.getByRole("heading", { name: "Matrix" })).toBeInTheDocument();
    expect(screen.getByText("8,5")).toBeInTheDocument();
  });

  it("shows a dash when the rating is not a number", () => {
    renderWithRouter(<MovieCard movie={{ id: 7, title: "Matrix", vote_average: null }} />);

    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("uses the fallback title for an untitled movie", () => {
    renderWithRouter(<MovieCard movie={{ id: 7, vote_average: 1 }} />);

    expect(screen.getByRole("heading", { name: "Filme sem título" })).toBeInTheDocument();
  });
});
