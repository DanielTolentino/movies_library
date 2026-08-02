import { Component } from "react";

import FeedbackPanel from "./FeedbackPanel";

class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Erro inesperado na interface.", error, info?.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="page-shell">
        <FeedbackPanel
          tone="error"
          title="Algo deu errado"
          message="Ocorreu um erro inesperado ao exibir esta página."
          actionLabel="Recarregar a página"
          onAction={this.handleReload}
        />
      </div>
    );
  }
}

export default ErrorBoundary;
