import { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";

function App() {
  const location = useLocation();
  const mainRef = useRef(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    mainRef.current?.focus();
  }, [location.pathname, location.search]);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Pular para o conteúdo principal
      </a>
      <Navbar />
      <main id="main-content" className="app-main" tabIndex="-1" ref={mainRef}>
        <Outlet />
      </main>
    </div>
  );
}

export default App;
