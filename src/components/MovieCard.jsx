import { useState } from "react";
import { Link } from "react-router-dom";
import { BiRightArrowAlt } from "react-icons/bi";
import MovieRating from "./MovieRating";
import { getMovieImageUrl } from "../services/movies";
import { getMovieTitle } from "../utils/movie";

import "./MovieCard.css";

export const MoviePoster = ({ movie, loading = "lazy", className = "" }) => {
  const imageUrl = getMovieImageUrl(movie.poster_path);
  const [failedImageUrl, setFailedImageUrl] = useState(null);
  const title = getMovieTitle(movie);
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

  return (
    <article className="movie-card">
      <Link className="movie-card__link" to={`/movie/${movie.id}`} aria-labelledby={titleId}>
        <MoviePoster movie={movie} />
        <div className="movie-card__content">
          <MovieRating className="movie-card__rating" voteAverage={movie.vote_average} />
          <h3 id={titleId}>{title}</h3>
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
