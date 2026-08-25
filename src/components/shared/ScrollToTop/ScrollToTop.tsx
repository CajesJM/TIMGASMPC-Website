import { useEffect } from "react";
import { useLocation } from "react-router-dom";
export function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      window.requestAnimationFrame(() => {
        const section = document.getElementById(hash.slice(1));
        if (typeof section?.scrollIntoView === "function") {
          section.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
      return;
    }

    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}
