import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import { getMovieImageUrl } from "../services/movies";

const MovieCard = ({ movie, showLink = true }) => {
  const imageUrl = getMovieImageUrl(movie.poster_path);

  return (
    <div className="movie-card">
      {imageUrl ? (
        <img src={imageUrl} alt={`Pôster de ${movie.title}`} />
      ) : (
        <span
          className="movie-poster-placeholder"
          role="img"
          aria-label="Pôster indisponível"
        >
          Pôster indisponível
        </span>
      )}
      <h2>{movie.title}</h2>
      <p>
        <FaStar /> {movie.vote_average}
      </p>
      {showLink && <Link to={`/movie/${movie.id}`}>Detalhes</Link>}
    </div>
  );
};

export default MovieCard;
