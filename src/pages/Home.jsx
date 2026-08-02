import { useEffect, useState } from "react";
import FeedbackPanel from "../components/FeedbackPanel";
import { MovieGrid, MovieGridSkeleton } from "../components/MovieGrid";
import { getTopRatedMovies } from "../services/movies";

import "./Home.css";

const Home = () => {
  const [topMovies, setTopMovies] = useState([]);
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [requestVersion, setRequestVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let isCurrentRequest = true;

    setStatus("loading");
    setErrorMessage("");

    getTopRatedMovies(controller.signal)
      .then((movies) => {
        if (!isCurrentRequest) return;

        setTopMovies(movies);
        setStatus("success");
      })
      .catch((error) => {
        if (!isCurrentRequest || error?.name === "AbortError") return;

        setErrorMessage(error?.message ?? "Não foi possível carregar os filmes.");
        setStatus("error");
      });

    return () => {
      isCurrentRequest = false;
      controller.abort();
    };
  }, [requestVersion]);

  const handleRetry = () => {
    setRequestVersion((version) => version + 1);
  };

  const statusMessage = {
    loading: "Carregando filmes mais bem avaliados.",
    error: "Não foi possível carregar os filmes mais bem avaliados.",
    success:
      topMovies.length === 0
        ? "Nenhum filme mais bem avaliado foi encontrado."
        : `${topMovies.length} filmes mais bem avaliados carregados.`,
  }[status];

  return (
    <section className="page-shell catalog-page" aria-labelledby="home-title">
      <header className="catalog-hero">
        <p className="eyebrow">Catálogo selecionado</p>
        <h1 id="home-title">CineVista</h1>
        <p className="catalog-hero__copy">
          Explore os filmes mais bem avaliados e encontre sua próxima história favorita.
        </p>
      </header>

      <section
        className="catalog-section"
        aria-labelledby="top-rated-title"
        aria-busy={status === "loading"}
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">Em destaque</p>
            <h2 id="top-rated-title">Mais bem avaliados</h2>
          </div>
          <p className="section-heading__description">
            Uma seleção para começar a explorar o catálogo.
          </p>
        </div>

        <p className="visually-hidden" aria-live="polite" aria-atomic="true">
          {statusMessage}
        </p>

        {status === "loading" && <MovieGridSkeleton />}
        {status === "error" && (
          <FeedbackPanel
            tone="error"
            title="Não foi possível carregar os filmes"
            message={errorMessage}
            actionLabel="Tentar novamente"
            onAction={handleRetry}
          />
        )}
        {status === "success" && topMovies.length === 0 && (
          <FeedbackPanel
            title="Nenhum filme encontrado"
            message="A lista de filmes mais bem avaliados está vazia no momento."
          />
        )}
        {status === "success" && topMovies.length > 0 && <MovieGrid movies={topMovies} />}
      </section>
    </section>
  );
};

export default Home;
