import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import { searchMovies } from "../services/movies";

import "./MoviesGrid.css";

const Search = () => {
  const [searchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const query = searchParams.get("q")?.trim() ?? "";

  useEffect(() => {
    const controller = new AbortController();

    if (!query) {
      setMovies([]);
      setErrorMessage("");
      setStatus("idle");
      return () => controller.abort();
    }

    setStatus("loading");
    setErrorMessage("");

    searchMovies(query, controller.signal)
      .then((results) => {
        setMovies(results);
        setStatus("success");
      })
      .catch((error) => {
        if (error?.name === "AbortError") return;

        setErrorMessage(error.message);
        setStatus("error");
      });

    return () => controller.abort();
  }, [query]);

  return (
    <div className="container">
      <h2 className="title">
        Resultados para: <span className="query-text">{query}</span>
      </h2>
      <div className="movies-container">
        {status === "idle" && <p>Digite um filme para iniciar a busca.</p>}
        {status === "loading" && <p>Carregando...</p>}
        {status === "error" && <p>{errorMessage}</p>}
        {status === "success" && movies.length === 0 && (
          <p>Nenhum filme encontrado.</p>
        )}
        {status === "success" && movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  );
};

export default Search;
