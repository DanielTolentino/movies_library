import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import FeedbackPanel from "../components/FeedbackPanel";
import { MovieGrid, MovieGridSkeleton } from "../components/MovieGrid";
import { searchMovies } from "../services/movies";

import "./Search.css";

const Search = () => {
  const [searchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [requestVersion, setRequestVersion] = useState(0);
  const query = searchParams.get("q")?.trim() ?? "";

  useEffect(() => {
    const controller = new AbortController();
    let isCurrentRequest = true;

    if (!query) {
      setMovies([]);
      setErrorMessage("");
      setStatus("idle");
      return () => {
        isCurrentRequest = false;
        controller.abort();
      };
    }

    setStatus("loading");
    setErrorMessage("");

    searchMovies(query, controller.signal)
      .then((results) => {
        if (!isCurrentRequest) return;

        setMovies(results);
        setStatus("success");
      })
      .catch((error) => {
        if (!isCurrentRequest || error?.name === "AbortError") return;

        console.error(`Falha ao buscar filmes para "${query}".`, error);
        setErrorMessage(error?.message ?? "Não foi possível carregar os filmes.");
        setStatus("error");
      });

    return () => {
      isCurrentRequest = false;
      controller.abort();
    };
  }, [query, requestVersion]);

  const handleRetry = () => {
    setRequestVersion((version) => version + 1);
  };

  const statusMessage = {
    idle: "Digite um título para pesquisar filmes.",
    loading: `Carregando resultados para ${query}.`,
    error: `Não foi possível carregar os resultados para ${query}.`,
    success:
      movies.length === 0
        ? `Nenhum resultado encontrado para ${query}.`
        : `${movies.length} resultados encontrados para ${query}.`,
  }[status];

  return (
    <section className="page-shell search-page" aria-labelledby="search-title">
      <header className="search-page__header">
        <p className="eyebrow">Busca</p>
        <h1 id="search-title">
          {query ? (
            <>
              Resultados para <span className="search-page__query">{query}</span>
            </>
          ) : (
            "Encontre seu próximo filme"
          )}
        </h1>
        <p className="search-page__lead">
          {query
            ? "Confira os títulos encontrados no catálogo."
            : "Use o campo de busca para pesquisar por título."}
        </p>
      </header>

      <section
        className="search-page__content"
        aria-labelledby="search-results-title"
        aria-busy={status === "loading"}
      >
        <h2 id="search-results-title" className="visually-hidden">
          Resultados da busca
        </h2>
        <p className="visually-hidden" aria-live="polite" aria-atomic="true">
          {statusMessage}
        </p>

        {status === "idle" && (
          <FeedbackPanel
            title="Comece uma busca"
            message="Digite o nome de um filme no campo acima para ver os resultados."
          />
        )}
        {status === "loading" && <MovieGridSkeleton />}
        {status === "error" && (
          <FeedbackPanel
            tone="error"
            title="Não foi possível carregar os resultados"
            message={errorMessage}
            actionLabel="Tentar novamente"
            onAction={handleRetry}
          />
        )}
        {status === "success" && movies.length === 0 && (
          <FeedbackPanel
            title="Nenhum filme encontrado"
            message={`Não encontramos resultados para “${query}”. Tente outro título.`}
          />
        )}
        {status === "success" && movies.length > 0 && <MovieGrid movies={movies} />}
      </section>
    </section>
  );
};

export default Search;
