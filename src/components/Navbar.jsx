import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { BiCameraMovie, BiSearchAlt2 } from "react-icons/bi";

import { MAX_QUERY_LENGTH } from "../services/movies";

import "./Navbar.css";

const Navbar = () => {
  const [searchParams] = useSearchParams();
  const activeQuery = searchParams.get("q") ?? "";
  const [search, setSearch] = useState(activeQuery);
  const [searchError, setSearchError] = useState("");
  const searchInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    setSearch(activeQuery);
    setSearchError("");
  }, [activeQuery]);

  const handleSubmit = (event) => {
    event.preventDefault();

    const normalizedSearch = search.trim();

    if (!normalizedSearch) {
      setSearchError("Digite o título de um filme para pesquisar.");
      searchInputRef.current?.focus();
      return;
    }

    const params = new URLSearchParams({ q: normalizedSearch });
    navigate(`/search?${params.toString()}`);
    setSearchError("");
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);

    if (searchError) {
      setSearchError("");
    }
  };

  return (
    <header className="site-header">
      <div className="site-header__content">
        <nav aria-label="Navegação principal">
          <Link className="brand" to="/" aria-label="CineVista, página inicial">
            <span className="brand__mark" aria-hidden="true">
              <BiCameraMovie />
            </span>
            <span>CineVista</span>
          </Link>
        </nav>

        <form className="search-form" role="search" noValidate onSubmit={handleSubmit}>
          <label className="visually-hidden" htmlFor="movie-search">
            Buscar filmes
          </label>
          <div
            className={`search-form__field${
              searchError ? " search-form__field--invalid" : ""
            }`}
          >
            <input
              ref={searchInputRef}
              id="movie-search"
              name="q"
              type="search"
              placeholder="Busque um filme"
              maxLength={MAX_QUERY_LENGTH}
              value={search}
              onChange={handleSearchChange}
              aria-invalid={Boolean(searchError)}
              aria-describedby={searchError ? "movie-search-error" : undefined}
            />
            <button className="search-form__button" type="submit">
              <BiSearchAlt2 aria-hidden="true" />
              <span className="visually-hidden">Buscar filmes</span>
            </button>
          </div>
          {searchError && (
            <p id="movie-search-error" className="search-form__error" role="alert">
              {searchError}
            </p>
          )}
        </form>
      </div>
    </header>
  );
};

export default Navbar;
