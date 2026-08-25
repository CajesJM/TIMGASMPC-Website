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

      console.log("🔍 Loading animation debug:", {
        loadingElement: !!loadingElement,
        logoContainer: !!logoContainer,
        navLogoTarget: !!navLogoTarget,
        navLogoTargetRect: navLogoTarget?.getBoundingClientRect(),
      });

      if (!loadingElement || !logoContainer) {
        console.warn("Loading screen elements not found");
        if (loadingElement) {
          loadingElement.style.opacity = "0";
          setTimeout(() => loadingElement.remove(), 400);
        }
        return;
      }

      if (!navLogoTarget) {
        console.warn("Nav logo target not found - using fallback fade");
        loadingElement.style.transition = "opacity 400ms ease";
        loadingElement.style.opacity = "0";
        setTimeout(() => loadingElement.remove(), 400);
        return;
      }

      // Calculate positions for FLIP animation
      const loadingRect = logoContainer.getBoundingClientRect();
      const navRect = navLogoTarget.getBoundingClientRect();

      console.log("Animation positions:", {
        loading: {
          x: loadingRect.left.toFixed(2),
          y: loadingRect.top.toFixed(2),
          w: loadingRect.width.toFixed(2),
          h: loadingRect.height.toFixed(2),
        },
        nav: {
          x: navRect.left.toFixed(2),
          y: navRect.top.toFixed(2),
          w: navRect.width.toFixed(2),
          h: navRect.height.toFixed(2),
        },
      });

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

      console.log("Animation values:", {
        deltaX: deltaX.toFixed(2),
        deltaY: deltaY.toFixed(2),
        scale: scale.toFixed(3),
        viewportOffset: viewportOffset.toFixed(2),
      });

      logoContainer.style.animation = "none";
      logoContainer.style.transition =
        "transform 900ms cubic-bezier(0.4, 0, 0.2, 1)";
      logoContainer.style.transformOrigin = "center center";

      setTimeout(() => {
        logoContainer.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${scale})`;
        console.log("Animation triggered!");
      }, 100);

      const cleanupTimer = setTimeout(() => {
        loadingElement.style.transition = "opacity 400ms ease";
        loadingElement.style.opacity = "0";
        console.log("Starting fade out");

        setTimeout(() => {
          loadingElement.remove();
          console.log("Loading screen removed");
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
