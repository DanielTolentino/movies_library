import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { describe, expect, it } from "vitest";

import Navbar from "./Navbar";

const LocationProbe = () => {
  const location = useLocation();
  return <span data-testid="location">{`${location.pathname}${location.search}`}</span>;
};

const renderNavbar = () =>
  render(
    <MemoryRouter initialEntries={["/"]}>
      <Navbar />
      <Routes>
        <Route path="*" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>,
  );

describe("Navbar", () => {
  it("navigates to the search page with the trimmed query and clears the input", async () => {
    renderNavbar();
    const input = screen.getByRole("searchbox", { name: "Buscar filmes" });

    await userEvent.type(input, "  the matrix  ");
    await userEvent.click(screen.getByRole("button", { name: "Buscar filmes" }));

    expect(screen.getByTestId("location")).toHaveTextContent("/search?q=the+matrix");
    expect(input).toHaveValue("");
  });

  it("shows a validation error for an empty query and keeps the current route", async () => {
    renderNavbar();

    await userEvent.click(screen.getByRole("button", { name: "Buscar filmes" }));

    const error = screen.getByRole("alert");
    expect(error).toHaveTextContent("Digite o título de um filme para pesquisar.");
    const input = screen.getByRole("searchbox", { name: "Buscar filmes" });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", "movie-search-error");
    expect(input).toHaveFocus();
    expect(screen.getByTestId("location")).toHaveTextContent("/");
  });

  it("clears the validation error once the user types again", async () => {
    renderNavbar();

    await userEvent.click(screen.getByRole("button", { name: "Buscar filmes" }));
    expect(screen.getByRole("alert")).toBeInTheDocument();

    await userEvent.type(screen.getByRole("searchbox", { name: "Buscar filmes" }), "m");

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("links the brand back to the home page", () => {
    renderNavbar();

    expect(screen.getByRole("link", { name: "CineVista, página inicial" })).toHaveAttribute(
      "href",
      "/",
    );
  });
});
