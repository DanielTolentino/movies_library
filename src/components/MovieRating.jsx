import { FaStar } from "react-icons/fa";
import { formatRating } from "../utils/movie";

const MovieRating = ({ voteAverage, className }) => {
  const rating = formatRating(voteAverage);

  return (
    <p className={className} aria-label={`Avaliação ${rating} de 10`}>
      <FaStar aria-hidden="true" />
      <span>{rating}</span>
      <span className="visually-hidden"> de 10</span>
    </p>
  );
};

export default MovieRating;
