import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import FeedbackPanel from "../components/FeedbackPanel";
import { MovieGrid, MovieGridSkeleton } from "../components/MovieGrid";
import { useMovieList } from "../hooks/useMovieList";
import { usePageTitle } from "../hooks/usePageTitle";
import { searchMovies } from "../services/movies";

import "./Search.css";

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";
  const fetchPage = useCallback(
    (page, signal) => searchMovies(query, page, signal),
    [query],
  );
  const { movies, status, errorMessage, hasMore, retry, loadMore } = useMovieList(
    fetchPage,
    { enabled: Boolean(query) },
  );

  usePageTitle(query ? `Resultados para ${query}` : "Busca");

  const statusMessage = {
    idle: "Digite um título para pesquisar filmes.",
    loading: `Carregando resultados para ${query}.`,
    "loading-more": `Carregando mais resultados para ${query}.`,
    error: `Não foi possível carregar os resultados para ${query}.`,
    success:
      movies.length === 0
        ? `Nenhum resultado encontrado para ${query}.`
        : `${movies.length} resultados encontrados para ${query}.`,
  }[status];

  return (
    <section className="page-shell search-page" aria-labelledby="search-title">
      <header className="search-page__header">
        <p className="eyebrow">Busca</p>
        <h1 id="search-title">
          {query ? (
            <>
              Resultados para <span className="search-page__query">{query}</span>
            </>
          ) : (
            "Encontre seu próximo filme"
          )}
        </h1>
        <p className="search-page__lead">
          {query
            ? "Confira os títulos encontrados no catálogo."
            : "Use o campo de busca para pesquisar por título."}
        </p>
      </header>

      <section
        className="search-page__content"
        aria-labelledby="search-results-title"
        aria-busy={status === "loading" || status === "loading-more"}
      >
        <h2 id="search-results-title" className="visually-hidden">
          Resultados da busca
        </h2>
        <p className="visually-hidden" aria-live="polite" aria-atomic="true">
          {statusMessage}
        </p>

        {status === "idle" && (
          <FeedbackPanel
            title="Comece uma busca"
            message="Digite o nome de um filme no campo acima para ver os resultados."
          />
        )}
        {status === "loading" && <MovieGridSkeleton />}
        {status === "error" && movies.length === 0 && (
          <FeedbackPanel
            tone="error"
            title="Não foi possível carregar os resultados"
            message={errorMessage}
            actionLabel="Tentar novamente"
            onAction={retry}
          />
        )}
        {status === "success" && movies.length === 0 && (
          <FeedbackPanel
            title="Nenhum filme encontrado"
            message={`Não encontramos resultados para “${query}”. Tente outro título.`}
          />
        )}
        {movies.length > 0 && <MovieGrid movies={movies} />}

        {status === "error" && movies.length > 0 && (
          <FeedbackPanel
            tone="error"
            title="Não foi possível carregar mais resultados"
            message={errorMessage}
            actionLabel="Tentar novamente"
            onAction={retry}
          />
        )}
        {(status === "success" || status === "loading-more") && hasMore && (
          <div className="load-more">
            <button
              className="load-more__button"
              type="button"
              onClick={loadMore}
              disabled={status === "loading-more"}
            >
              {status === "loading-more" ? "Carregando…" : "Carregar mais resultados"}
            </button>
          </div>
        )}
      </section>
    </section>
  );
};

export default Search;
