import { ReactNode, useEffect } from "react";

interface LoadingScreenProps {
  children: ReactNode;
}

export function LoadingScreen({ children }: LoadingScreenProps) {
  useEffect(() => {
    const startAnimationTimer = setTimeout(() => {
      const loadingElement = document.getElementById("loading-screen");
      const logoContainer = document.getElementById("loading-logo");
      const navLogoTarget =
        document.querySelector<HTMLElement>("[data-logo-mark]");

      if (!loadingElement || !logoContainer) {
        if (loadingElement) {
          loadingElement.style.opacity = "0";
          setTimeout(() => loadingElement.remove(), 400);
        }
        return;
      }

      if (!navLogoTarget) {
        loadingElement.style.transition = "opacity 400ms ease";
        loadingElement.style.opacity = "0";
        setTimeout(() => loadingElement.remove(), 400);
        return;
      }

      const loadingRect = logoContainer.getBoundingClientRect();
      const navRect = navLogoTarget.getBoundingClientRect();

      const viewportOffset = window.innerWidth * 0.02;
      const deltaX =
        navRect.left +
        navRect.width / 2 -
        (loadingRect.left + loadingRect.width / 2) -
        viewportOffset;
      const deltaY =
        navRect.top +
        navRect.height / 2 -
        (loadingRect.top + loadingRect.height / 2);

      const scaleX = navRect.width / loadingRect.width;
      const scaleY = navRect.height / loadingRect.height;
      const scale = Math.min(scaleX, scaleY);

      logoContainer.style.animation = "none";
      logoContainer.style.transition =
        "transform 900ms cubic-bezier(0.4, 0, 0.2, 1)";
      logoContainer.style.transformOrigin = "center center";

      setTimeout(() => {
        logoContainer.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${scale})`;
      }, 100);

      const cleanupTimer = setTimeout(() => {
        loadingElement.style.transition = "opacity 400ms ease";
        loadingElement.style.opacity = "0";

        setTimeout(() => {
          loadingElement.remove();
        }, 400);
      }, 1100);

      return () => {
        clearTimeout(cleanupTimer);
      };
    }, 1100);

    return () => {
      clearTimeout(startAnimationTimer);
    };
  }, []);

  return <>{children}</>;
}
