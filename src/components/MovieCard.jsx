import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import { BiRightArrowAlt } from "react-icons/bi";
import { getMovieImageUrl } from "../services/movies";

import "./MovieCard.css";

const ratingFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
});

const getMovieTitle = (movie) => movie.title?.trim() || "Filme sem título";

const getReleaseYear = (movie) => movie.release_date?.slice(0, 4) || null;

export const MoviePoster = ({ movie, loading = "lazy", className = "" }) => {
  const imageUrl = getMovieImageUrl(movie.poster_path);
  const [failedImageUrl, setFailedImageUrl] = useState(null);
  const title = getMovieTitle(movie);

  useEffect(() => {
    setFailedImageUrl(null);
  }, [imageUrl]);

  const showImage = Boolean(imageUrl) && failedImageUrl !== imageUrl;
  const posterClassName = [
    "movie-poster",
    className,
    !showImage && "movie-poster--placeholder",
  ]
    .filter(Boolean)
    .join(" ");

  if (!showImage) {
    return (
      <div
        className={posterClassName}
        role="img"
        aria-label={`Pôster de ${title} indisponível`}
      >
        <span>Pôster indisponível</span>
      </div>
    );
  }

  return (
    <div className={posterClassName}>
      <img
        className="movie-poster__image"
        src={imageUrl}
        alt={`Pôster de ${title}`}
        width="500"
        height="750"
        loading={loading}
        decoding="async"
        onError={() => setFailedImageUrl(imageUrl)}
      />
    </div>
  );
};

const MovieCard = ({ movie }) => {
  const title = getMovieTitle(movie);
  const titleId = `movie-title-${movie.id}`;
  const releaseYear = getReleaseYear(movie);
  const rating = Number.isFinite(movie.vote_average)
    ? ratingFormatter.format(movie.vote_average)
    : "—";

  return (
    <article className="movie-card">
      <Link className="movie-card__link" to={`/movie/${movie.id}`} aria-labelledby={titleId}>
        <MoviePoster movie={movie} />
        <div className="movie-card__content">
          <p className="movie-card__rating" aria-label={`Avaliação ${rating} de 10`}>
            <FaStar aria-hidden="true" />
            <span>{rating}</span>
            <span className="visually-hidden"> de 10</span>
          </p>
          <h3 id={titleId}>{title}</h3>
          {releaseYear && <p className="movie-card__year">{releaseYear}</p>}
          <span className="movie-card__action">
            Ver detalhes
            <BiRightArrowAlt aria-hidden="true" />
          </span>
        </div>
      </Link>
    </article>
  );
};

export default MovieCard;
