import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  BsGraphUp,
  BsWallet2,
  BsHourglassSplit,
  BsFillFileEarmarkTextFill,
} from "react-icons/bs";

import MovieCard from "../components/MovieCard";
import { getMovieById } from "../services/movies";

import "./Movie.css";

const Movie = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");

  const formatCurrency = (number) => {
    if (typeof number !== "number") return "Não informado";

    return number.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
  };

  useEffect(() => {
    const controller = new AbortController();

    setMovie(null);
    setErrorMessage("");
    setStatus("loading");

    getMovieById(id, controller.signal)
      .then((movieData) => {
        setMovie(movieData);
        setStatus("success");
      })
      .catch((error) => {
        if (error?.name === "AbortError") return;

        setErrorMessage(error.message);
        setStatus("error");
      });

    return () => controller.abort();
  }, [id]);

  return (
    <div className="movie-page">
      {status === "loading" && <p>Carregando...</p>}
      {status === "error" && <p>{errorMessage}</p>}
      {status === "success" && movie && (
        <>
          <MovieCard movie={movie} showLink={false} />
          <p className="tagline">{movie.tagline}</p>
          <div className="info">
            <h3>
              <BsWallet2 /> Orçamento:
            </h3>
            <p>{formatCurrency(movie.budget)}</p>
          </div>
          <div className="info">
            <h3>
              <BsGraphUp /> Receita:
            </h3>
            <p>{formatCurrency(movie.revenue)}</p>
          </div>
          <div className="info">
            <h3>
              <BsHourglassSplit /> Duração:
            </h3>
            <p>{movie.runtime ?? "Não informado"}</p>
          </div>
          <div className="info description">
            <h3>
              <BsFillFileEarmarkTextFill /> Descrição:
            </h3>
            <p>{movie.overview || "Descrição não informada."}</p>
          </div>
        </>
      )}
    </div>
  );
};

export default Movie;
