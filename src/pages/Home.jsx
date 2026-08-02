import { useCallback } from "react";
import FeedbackPanel from "../components/FeedbackPanel";
import { MovieGrid, MovieGridSkeleton } from "../components/MovieGrid";
import { useMovieList } from "../hooks/useMovieList";
import { usePageTitle } from "../hooks/usePageTitle";
import { getTopRatedMovies } from "../services/movies";

import "./Home.css";

const Home = () => {
  const fetchPage = useCallback(
    (page, signal) => getTopRatedMovies(page, signal),
    [],
  );
  const {
    movies: topMovies,
    status,
    errorMessage,
    hasMore,
    retry,
    loadMore,
  } = useMovieList(fetchPage);

  usePageTitle("Mais bem avaliados");

  const statusMessage = {
    loading: "Carregando filmes mais bem avaliados.",
    "loading-more": "Carregando mais filmes.",
    error: "Não foi possível carregar os filmes mais bem avaliados.",
    success:
      topMovies.length === 0
        ? "Nenhum filme mais bem avaliado foi encontrado."
        : `${topMovies.length} filmes mais bem avaliados carregados.`,
  }[status];

  return (
    <section className="page-shell catalog-page" aria-labelledby="home-title">
      <header className="catalog-hero">
        <p className="eyebrow">Catálogo selecionado</p>
        <h1 id="home-title">CineVista</h1>
        <p className="catalog-hero__copy">
          Explore os filmes mais bem avaliados e encontre sua próxima história favorita.
        </p>
      </header>

      <section
        className="catalog-section"
        aria-labelledby="top-rated-title"
        aria-busy={status === "loading" || status === "loading-more"}
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">Em destaque</p>
            <h2 id="top-rated-title">Mais bem avaliados</h2>
          </div>
          <p className="section-heading__description">
            Uma seleção para começar a explorar o catálogo.
          </p>
        </div>

        <p className="visually-hidden" aria-live="polite" aria-atomic="true">
          {statusMessage}
        </p>

        {status === "loading" && <MovieGridSkeleton />}
        {status === "error" && topMovies.length === 0 && (
          <FeedbackPanel
            tone="error"
            title="Não foi possível carregar os filmes"
            message={errorMessage}
            actionLabel="Tentar novamente"
            onAction={retry}
          />
        )}
        {status === "success" && topMovies.length === 0 && (
          <FeedbackPanel
            title="Nenhum filme encontrado"
            message="A lista de filmes mais bem avaliados está vazia no momento."
          />
        )}
        {topMovies.length > 0 && <MovieGrid movies={topMovies} />}

        {status === "error" && topMovies.length > 0 && (
          <FeedbackPanel
            tone="error"
            title="Não foi possível carregar mais filmes"
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
              {status === "loading-more" ? "Carregando…" : "Carregar mais filmes"}
            </button>
          </div>
        )}
      </section>
    </section>
  );
};

export default Home;
