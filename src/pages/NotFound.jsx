import { Link } from "react-router-dom";

import FeedbackPanel from "../components/FeedbackPanel";
import { usePageTitle } from "../hooks/usePageTitle";

const NotFound = () => {
  usePageTitle("Página não encontrada");

  return (
    <section className="page-shell" aria-labelledby="not-found-title">
      <header className="search-page__header">
        <p className="eyebrow">Erro 404</p>
        <h1 id="not-found-title">Página não encontrada</h1>
      </header>

      <FeedbackPanel
        title="Este endereço não existe"
        message="Confira o endereço digitado ou volte para o catálogo de filmes."
      >
        <Link className="feedback-panel__link" to="/">
          Voltar para a página inicial
        </Link>
      </FeedbackPanel>
    </section>
  );
};

export default NotFound;
