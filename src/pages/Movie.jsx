import { useCallback } from "react";
import { useParams } from "react-router-dom";

import FeedbackPanel from "../components/FeedbackPanel";
import { MoviePoster } from "../components/MovieCard";
import MovieRating from "../components/MovieRating";
import { useAsyncData } from "../hooks/useAsyncData";
import { getMovieById } from "../services/movies";
import { getMovieTitle } from "../utils/movie";

import "./Movie.css";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const formatCurrency = (value) => {
  if (!Number.isFinite(value) || value <= 0) return "Não informado";

  return currencyFormatter.format(value);
};

const formatDuration = (minutes) => {
  if (!Number.isFinite(minutes) || minutes <= 0) return "Não informada";

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) return `${remainingMinutes} min`;
  if (remainingMinutes === 0) return `${hours}h`;

  return `${hours}h ${remainingMinutes}min`;
};

const Movie = () => {
  const { id } = useParams();

  const fetchMovie = useCallback((signal) => getMovieById(id, signal), [id]);

  const {
    data: movie,
    status,
    errorMessage,
    retry: handleRetry,
  } = useAsyncData(fetchMovie, [fetchMovie], {
    errorMessage: "Não foi possível carregar o filme.",
  });

  const title = getMovieTitle(movie);
  const statusMessage = {
    loading: "Carregando detalhes do filme.",
    error: "Não foi possível carregar os detalhes do filme.",
    success: movie ? `Detalhes de ${title} carregados.` : "",
  }[status];

  return (
    <section className="page-shell movie-detail-page" aria-busy={status === "loading"}>
      <p className="visually-hidden" aria-live="polite" aria-atomic="true">
        {statusMessage}
      </p>

      {status === "loading" && (
        <div className="movie-detail__loading" role="status">
          <span className="movie-detail__spinner" aria-hidden="true" />
          <span>Carregando detalhes do filme…</span>
        </div>
      )}
      {status === "error" && (
        <FeedbackPanel
          tone="error"
          title="Não foi possível carregar o filme"
          message={errorMessage}
          actionLabel="Tentar novamente"
          onAction={handleRetry}
        />
      )}
      {status === "success" && movie && (
        <article className="movie-detail" aria-labelledby="movie-title">
          <div className="movie-detail__hero">
            <MoviePoster movie={movie} loading="eager" className="movie-detail__poster" />

            <div className="movie-detail__content">
              <p className="eyebrow">Detalhes do filme</p>
              <h1 id="movie-title">{title}</h1>
              {movie.tagline && <p className="movie-detail__tagline">{movie.tagline}</p>}
              <MovieRating
                className="movie-detail__rating"
                voteAverage={movie.vote_average}
              />

              <dl className="movie-detail__facts">
                <div className="movie-detail__fact">
                  <dt>Orçamento</dt>
                  <dd>{formatCurrency(movie.budget)}</dd>
                </div>
                <div className="movie-detail__fact">
                  <dt>Receita</dt>
                  <dd>{formatCurrency(movie.revenue)}</dd>
                </div>
                <div className="movie-detail__fact">
                  <dt>Duração</dt>
                  <dd>{formatDuration(movie.runtime)}</dd>
                </div>
              </dl>
            </div>
          </div>

          <section className="movie-detail__synopsis" aria-labelledby="movie-overview-title">
            <p className="eyebrow">Sobre o filme</p>
            <h2 id="movie-overview-title">Sinopse</h2>
            <p>{movie.overview || "Nenhuma sinopse foi informada para este filme."}</p>
          </section>
        </article>
      )}
    </section>
  );
};

export default Movie;
