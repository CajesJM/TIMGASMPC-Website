import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState, type KeyboardEvent } from "react";
import styles from "@/styles/user/components/home/PhotoCarousel.module.css";

export type CarouselPhoto = {
  src: string;
  alt: string;
  caption: string;
};

type PhotoCarouselProps = {
  ariaLabel: string;
  photos: CarouselPhoto[];
};

export function PhotoCarousel({ ariaLabel, photos }: PhotoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const currentPhoto = photos[currentIndex];

  useEffect(() => {
    if (photos.length < 2 || isPaused) return;

    const reduceMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const timer = window.setInterval(() => {
      setCurrentIndex((index) => (index + 1) % photos.length);
    }, 5600);

    return () => window.clearInterval(timer);
  }, [isPaused, photos.length]);

  const showPrevious = () => {
    setCurrentIndex((index) => (index - 1 + photos.length) % photos.length);
  };

  const showNext = () => {
    setCurrentIndex((index) => (index + 1) % photos.length);
  };

  const handleImageKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showPrevious();
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      showNext();
    }
  };

  if (photos.length === 0) return null;

  return (
    <section
      className={styles.carousel}
      aria-label={ariaLabel}
      aria-roledescription="carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      <div className={styles.viewport}>
        <button
          className={styles.imageButton}
          type="button"
          onClick={showNext}
          onKeyDown={handleImageKeyDown}
          aria-label={`View next photo. Currently showing ${currentPhoto.caption}`}
        >
          <span
            className={styles.track}
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {photos.map((photo, index) => (
              <img
                key={photo.src}
                src={photo.src}
                alt={photo.alt}
                aria-hidden={index !== currentIndex}
              />
            ))}
          </span>
        </button>
        <button
          className={`${styles.arrow} ${styles.previous}`}
          type="button"
          onClick={showPrevious}
          aria-label="Previous gallery photo"
        >
          <ChevronLeft aria-hidden="true" />
        </button>
        <button
          className={`${styles.arrow} ${styles.next}`}
          type="button"
          onClick={showNext}
          aria-label="Next gallery photo"
        >
          <ChevronRight aria-hidden="true" />
        </button>
      </div>
      <div className={styles.footer}>
        <div className={styles.dots} aria-label="Choose a gallery photo">
          {photos.map((photo, index) => (
            <button
              key={photo.src}
              className={index === currentIndex ? styles.active : ""}
              type="button"
              onClick={() => setCurrentIndex(index)}
              aria-label={`Show photo ${index + 1}: ${photo.caption}`}
              aria-current={index === currentIndex ? "true" : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
