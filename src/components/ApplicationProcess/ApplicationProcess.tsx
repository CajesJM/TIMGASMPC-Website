import { useEffect, useRef, useState, type CSSProperties } from "react";
import styles from "./ApplicationProcess.module.css";

type ApplicationProcessProps = {
  eyebrow: string;
  title: string;
  description: string;
  steps: readonly string[];
};

const stepTitles = [
  "Confirm eligibility",
  "Gather requirements",
  "Review terms and fees",
  "Submit with confidence",
];

const clamp = (value: number) => Math.min(1, Math.max(0, value));

export function ApplicationProcess({
  eyebrow,
  title,
  description,
  steps,
}: ApplicationProcessProps) {
  const sceneRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;

    const updateProgress = () => {
      frame = 0;
      const scene = sceneRef.current;
      if (!scene) return;

      const bounds = scene.getBoundingClientRect();
      const availableScroll = Math.max(1, bounds.height - window.innerHeight);
      setProgress(clamp(-bounds.top / availableScroll));
    };

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateProgress);
    };

    requestUpdate();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  const sceneStyle = { "--process-progress": progress } as CSSProperties;

  return (
    <section ref={sceneRef} className={styles.scene} aria-label={title}>
      <div className={styles.panel} style={sceneStyle}>
        <header className={styles.heading}>
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
          <p>{description}</p>
        </header>

        <div className={styles.map}>
          <svg
            className={styles.path}
            viewBox="0 0 1200 300"
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
          >
            <path
              className={styles.pathBase}
              d="M72 190C172 245 264 250 360 85C454-48 554-8 650 175C742 316 840 282 940 95C1016 5 1084 24 1130 60"
            />
            <path
              className={styles.pathProgress}
              d="M72 190C172 245 264 250 360 85C454-48 554-8 650 175C742 316 840 282 940 95C1016 5 1084 24 1130 60"
              pathLength="1"
            />
          </svg>

          <ol className={styles.stepList}>
            {steps.map((step, index) => {
              const threshold = index / Math.max(1, steps.length - 1);
              const isActive = progress >= threshold - 0.06;

              return (
                <li
                  key={step}
                  className={styles[`step${index + 1}`]}
                  data-active={isActive}
                >
                  <span className={styles.marker} aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className={styles.stepCopy}>
                    <h3>{stepTitles[index] ?? `Step ${index + 1}`}</h3>
                    <p>{step}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
