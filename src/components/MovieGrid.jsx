import MovieCard from "./MovieCard";

import "./MovieGrid.css";

export const MovieGrid = ({ movies }) => {
  return (
    <ul className="movie-grid">
      {movies.map((movie) => (
        <li className="movie-grid__item" key={movie.id}>
          <MovieCard movie={movie} />
        </li>
      ))}
    </ul>
  );
};

export const MovieGridSkeleton = ({ count = 8 }) => {
  return (
    <ul className="movie-grid" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <li className="movie-grid__item" key={index}>
          <div className="movie-card-skeleton">
            <div className="movie-card-skeleton__poster" />
            <div className="movie-card-skeleton__content">
              <span />
              <span />
              <span />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};
