import { Outlet } from "react-router-dom";

import ErrorBoundary from "./components/ErrorBoundary";
import Navbar from "./components/Navbar";

function App() {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Pular para o conteúdo principal
      </a>
      <Navbar />
      <main id="main-content" className="app-main" tabIndex="-1">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
}

export default App;
