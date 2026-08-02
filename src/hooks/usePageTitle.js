import { useEffect } from "react";

const SITE_NAME = "CineVista";

export const usePageTitle = (title) => {
  useEffect(() => {
    document.title = title ? `${title} — ${SITE_NAME}` : `${SITE_NAME} — descubra filmes`;
  }, [title]);
};
