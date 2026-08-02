import { useEffect, useState } from "react";
import MovieCard from "../components/MovieCard";
import { getTopRatedMovies } from "../services/movies";

import "./MoviesGrid.css";

const Home = () => {
  const [topMovies, setTopMovies] = useState([]);
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    getTopRatedMovies(controller.signal)
      .then((movies) => {
        setTopMovies(movies);
        setStatus("success");
      })
      .catch((error) => {
        if (error?.name === "AbortError") return;

        setErrorMessage(error.message);
        setStatus("error");
      });

    return () => controller.abort();
  }, []);

  return (
    <div className="container">
      <h2 className="title">Melhores filmes:</h2>
      <div className="movies-container">
        {status === "loading" && <p>Carregando...</p>}
        {status === "error" && <p>{errorMessage}</p>}
        {status === "success" && topMovies.length === 0 && (
          <p>Nenhum filme encontrado.</p>
        )}
        {status === "success" && topMovies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  );
};

export default Home;
