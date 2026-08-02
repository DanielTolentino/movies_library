const ratingFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
});

export const getMovieTitle = (movie) => movie?.title?.trim() || "Filme sem título";

export const formatRating = (voteAverage) =>
  Number.isFinite(voteAverage) ? ratingFormatter.format(voteAverage) : "—";
