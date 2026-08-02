import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FaStar } from "react-icons/fa";

import FeedbackPanel from "../components/FeedbackPanel";
import { MoviePoster } from "../components/MovieCard";
import { getMovieById } from "../services/movies";

import "./Movie.css";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const ratingFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
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
  const [movie, setMovie] = useState(null);
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [requestVersion, setRequestVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let isCurrentRequest = true;

    setMovie(null);
    setErrorMessage("");
    setStatus("loading");

    getMovieById(id, controller.signal)
      .then((movieData) => {
        if (!isCurrentRequest) return;

        setMovie(movieData);
        setStatus("success");
      })
      .catch((error) => {
        if (!isCurrentRequest || error?.name === "AbortError") return;

        setErrorMessage(error?.message ?? "Não foi possível carregar o filme.");
        setStatus("error");
      });

    return () => {
      isCurrentRequest = false;
      controller.abort();
    };
  }, [id, requestVersion]);

  const handleRetry = () => {
    setRequestVersion((version) => version + 1);
  };

  const title = movie?.title?.trim() || "Filme sem título";
  const rating = Number.isFinite(movie?.vote_average)
    ? ratingFormatter.format(movie.vote_average)
    : "—";
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
              <p className="movie-detail__rating" aria-label={`Avaliação ${rating} de 10`}>
                <FaStar aria-hidden="true" />
                <span>{rating}</span>
                <span className="visually-hidden"> de 10</span>
              </p>

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
