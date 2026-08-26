import {
  ArrowLeft,
  ArrowRight,
  Bell,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Mail,
  Newspaper,
  Phone,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type UIEvent,
} from "react";
import { Button } from "@/components/shared/Button/Button";
import { PageHeader } from "@/components/shared/PageHeader/PageHeader";
import { fetchPublishedPosts } from "@/features/posts/publicPosts";
import {
  formatPostDate,
  type PostCategory,
  type PublishedPost,
} from "@/features/posts/postTypes";
import styles from "@/styles/user/pages/ContentPage.module.css";

type NewsCategory = Exclude<PostCategory, "certification">;

const showcaseGroups: Array<{
  category: NewsCategory;
  title: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    category: "announcement",
    title: "Announcements",
    description:
      "Official notices, schedules, advisories, and important member information.",
    icon: Bell,
  },
  {
    category: "news",
    title: "Cooperative news",
    description:
      "Recent activities, programs, community initiatives, and cooperative updates.",
    icon: Newspaper,
  },
  {
    category: "achievement",
    title: "Achievement showcase",
    description:
      "Milestones and accomplishments recognized and published by TIMGAS MPC.",
    icon: Trophy,
  },
];

export function NewsPage() {
  const [shouldLoadPosts, setShouldLoadPosts] = useState(false);
  const [posts, setPosts] = useState<PublishedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(
    () => new Set(),
  );
  const [activeSlides, setActiveSlides] = useState<
    Record<NewsCategory, number>
  >({ announcement: 0, news: 0, achievement: 0 });
  const [overflowingCarousels, setOverflowingCarousels] = useState<
    Record<NewsCategory, boolean>
  >({ announcement: false, news: false, achievement: false });
  const [crossfadingCarousels, setCrossfadingCarousels] = useState<
    Set<NewsCategory>
  >(() => new Set());
  const carouselRefs = useRef<
    Partial<Record<NewsCategory, HTMLDivElement | null>>
  >({});
  const sectionRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({ active: false, startX: 0, startScroll: 0 });
  const crossfadeTimers = useRef<Partial<Record<NewsCategory, number>>>({});

  useEffect(
    () => () => {
      Object.values(crossfadeTimers.current).forEach((timer) => {
        if (timer) window.clearTimeout(timer);
      });
    },
    [],
  );

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || typeof IntersectionObserver === "undefined") {
      setShouldLoadPosts(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShouldLoadPosts(true);
        observer.disconnect();
      },
      { rootMargin: "800px 0px" },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!shouldLoadPosts) return;
    let active = true;
    void fetchPublishedPosts()
      .then((publishedPosts) => {
        if (active) setPosts(publishedPosts);
      })
      .catch((error) => {
        console.error("Unable to load TIMGAS posts.", error);
        if (active) setLoadFailed(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [shouldLoadPosts]);

  useEffect(() => {
    const measureCarousels = () => {
      const next = showcaseGroups.reduce<Record<NewsCategory, boolean>>(
        (result, { category }) => {
          const carousel = carouselRefs.current[category];
          result[category] = Boolean(
            carousel && carousel.scrollWidth > carousel.clientWidth + 1,
          );
          return result;
        },
        { announcement: false, news: false, achievement: false },
      );
      setOverflowingCarousels((current) =>
        current.announcement === next.announcement &&
        current.news === next.news &&
        current.achievement === next.achievement
          ? current
          : next,
      );
    };

    const frame = window.requestAnimationFrame(measureCarousels);
    window.addEventListener("resize", measureCarousels);
    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(measureCarousels);
    Object.values(carouselRefs.current).forEach((carousel) => {
      if (carousel) observer?.observe(carousel);
    });
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", measureCarousels);
      observer?.disconnect();
    };
  }, [posts]);

  const toggleDescription = (postId: string) => {
    setExpandedPosts((current) => {
      const next = new Set(current);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  };

  const moveCarousel = (category: NewsCategory, direction: -1 | 1) => {
    const carousel = carouselRefs.current[category];
    if (!carousel) return;
    carousel.scrollBy({
      left: direction * carousel.clientWidth,
      behavior: "smooth",
    });
  };

  const playCarouselCrossfade = (category: NewsCategory) => {
    const previousTimer = crossfadeTimers.current[category];
    if (previousTimer) window.clearTimeout(previousTimer);
    setCrossfadingCarousels((current) => new Set(current).add(category));
    crossfadeTimers.current[category] = window.setTimeout(() => {
      setCrossfadingCarousels((current) => {
        const next = new Set(current);
        next.delete(category);
        return next;
      });
    }, 360);
  };

  const goToSlide = (category: NewsCategory, index: number) => {
    const carousel = carouselRefs.current[category];
    const card = carousel?.children.item(index) as HTMLElement | null;
    if (!carousel || !card) return;
    carousel.scrollTo({
      left: card.offsetLeft - carousel.offsetLeft,
      behavior: "smooth",
    });
  };

  const trackActiveSlide = (
    category: NewsCategory,
    event: UIEvent<HTMLDivElement>,
  ) => {
    const carousel = event.currentTarget;
    const cards = Array.from(carousel.children) as HTMLElement[];
    if (cards.length === 0) return;
    const nearestIndex = cards.reduce((nearest, card, index) => {
      const nearestDistance = Math.abs(
        cards[nearest].offsetLeft - carousel.offsetLeft - carousel.scrollLeft,
      );
      const currentDistance = Math.abs(
        card.offsetLeft - carousel.offsetLeft - carousel.scrollLeft,
      );
      return currentDistance < nearestDistance ? index : nearest;
    }, 0);
    setActiveSlides((current) => {
      if (current[category] === nearestIndex) return current;
      playCarouselCrossfade(category);
      return { ...current, [category]: nearestIndex };
    });
  };

  const startMouseDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (
      event.pointerType !== "mouse" ||
      event.button !== 0 ||
      (event.target as HTMLElement).closest("button")
    )
      return;
    dragState.current = {
      active: true,
      startX: event.clientX,
      startScroll: event.currentTarget.scrollLeft,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const continueMouseDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragState.current.active) return;
    event.currentTarget.scrollLeft =
      dragState.current.startScroll -
      (event.clientX - dragState.current.startX);
  };

  const stopMouseDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragState.current.active) return;
    dragState.current.active = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const newsPosts = posts.filter((post) => post.category !== "certification");

  return (
    <div id="news" ref={sectionRef}>
      <PageHeader
        headingLevel={2}
        eyebrow="News and notices"
        title="Verified updates from TIMGAS MPC."
        description="Official announcements, cooperative news, and achievements published by the TIMGAS MPC manager."
        compact
      />

      <section className={styles.section} aria-busy={loading}>
        <div className="container">
          {loading ? (
            <div className={styles.newsLoading} role="status">
              Loading official updates…
            </div>
          ) : newsPosts.length > 0 ? (
            <div className={styles.postShowcase}>
              {showcaseGroups
                .filter(({ category }) =>
                  newsPosts.some((post) => post.category === category),
                )
                .map(({ category, title, description, icon: Icon }) => {
                  const categoryPosts = newsPosts.filter(
                    (post) => post.category === category,
                  );
                  return (
                    <section
                      className={styles.postGroup}
                      key={category}
                      aria-labelledby={`${category}-heading`}
                    >
                      <div className={styles.postGroupHeader}>
                        <div className={styles.postGroupTitle}>
                          <span>
                            <Icon aria-hidden="true" />
                          </span>
                          <div>
                            <p className="eyebrow">{category}</p>
                            <h3 id={`${category}-heading`}>{title}</h3>
                            <p>{description}</p>
                          </div>
                        </div>
                        <span className={styles.postCount}>
                          {categoryPosts.length}{" "}
                          {categoryPosts.length === 1 ? "update" : "updates"}
                        </span>
                      </div>
                      <div className={styles.carouselShell}>
                        {overflowingCarousels[category] && (
                          <>
                            <button
                              className={`${styles.carouselEdgeButton} ${styles.carouselPrevious}`}
                              type="button"
                              onClick={() => moveCarousel(category, -1)}
                              aria-label={`Show previous ${title.toLowerCase()}`}
                            >
                              <ArrowLeft />
                            </button>
                            <button
                              className={`${styles.carouselEdgeButton} ${styles.carouselNext}`}
                              type="button"
                              onClick={() => moveCarousel(category, 1)}
                              aria-label={`Show next ${title.toLowerCase()}`}
                            >
                              <ArrowRight />
                            </button>
                          </>
                        )}
                        <div
                          className={styles.postGrid}
                          data-crossfading={
                            crossfadingCarousels.has(category) || undefined
                          }
                          ref={(element) => {
                            carouselRefs.current[category] = element;
                          }}
                          role="region"
                          aria-label={`${title} posts`}
                          tabIndex={0}
                          onScroll={(event) =>
                            trackActiveSlide(category, event)
                          }
                          onPointerDown={startMouseDrag}
                          onPointerMove={continueMouseDrag}
                          onPointerUp={stopMouseDrag}
                          onPointerCancel={stopMouseDrag}
                        >
                          {categoryPosts.map((post) => {
                            const isExpanded = expandedPosts.has(post.id);
                            const hasLongDescription =
                              post.description.length > 240;
                            const descriptionId = `post-description-${post.id}`;
                            return (
                              <article
                                className={styles.postCard}
                                key={post.id}
                              >
                                <div
                                  className={`${styles.postPhoto} ${post.photoUrl ? "" : styles.postPhotoPlaceholder}`}
                                >
                                  {post.photoUrl ? (
                                    <img
                                      src={post.photoUrl}
                                      alt={`Photo for ${post.title}`}
                                      loading="lazy"
                                    />
                                  ) : (
                                    <Icon aria-hidden="true" />
                                  )}
                                </div>
                                <div className={styles.postContent}>
                                  <div className={styles.postMeta}>
                                    <time dateTime={post.date}>
                                      <CalendarDays aria-hidden="true" />{" "}
                                      {formatPostDate(post.date)}
                                    </time>
                                  </div>
                                  <h4>{post.title}</h4>
                                  <p
                                    id={descriptionId}
                                    className={`${styles.postDescription} ${
                                      !isExpanded && hasLongDescription
                                        ? styles.postDescriptionCollapsed
                                        : hasLongDescription
                                          ? styles.postDescriptionExpanded
                                          : ""
                                    }`}
                                  >
                                    {post.description}
                                  </p>
                                  {hasLongDescription && (
                                    <button
                                      className={styles.readMore}
                                      type="button"
                                      aria-expanded={isExpanded}
                                      aria-controls={descriptionId}
                                      onClick={() => toggleDescription(post.id)}
                                    >
                                      {isExpanded ? (
                                        <>
                                          Show less <ChevronUp />
                                        </>
                                      ) : (
                                        <>
                                          Read more <ChevronDown />
                                        </>
                                      )}
                                    </button>
                                  )}
                                </div>
                              </article>
                            );
                          })}
                        </div>
                        {categoryPosts.length > 1 && (
                          <div
                            className={styles.carouselDots}
                            aria-label={`${title} slide selection`}
                          >
                            {categoryPosts.map((post, index) => (
                              <button
                                className={
                                  activeSlides[category] === index
                                    ? styles.activeDot
                                    : undefined
                                }
                                type="button"
                                key={post.id}
                                onClick={() => goToSlide(category, index)}
                                aria-label={`Show ${title.toLowerCase()} item ${index + 1}`}
                                aria-current={
                                  activeSlides[category] === index
                                    ? "true"
                                    : undefined
                                }
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </section>
                  );
                })}
            </div>
          ) : (
            <div className={styles.emptyNews}>
              <Bell aria-hidden="true" />
              <div>
                <p className="eyebrow">Current status</p>
                <h2>
                  {loadFailed
                    ? "Official updates are temporarily unavailable."
                    : "No official announcement has been posted yet."}
                </h2>
                <p>
                  For current advisories, schedules, program availability, and
                  member notices, contact or visit the TIMGAS MPC office
                  directly.
                </p>
                <div className={styles.contactLinks}>
                  <a href="tel:+639382242376">
                    <Phone size={17} /> +63 938 224 2376
                  </a>
                  <a href="mailto:timgascooperative@gmail.com">
                    <Mail size={17} /> timgascooperative@gmail.com
                  </a>
                </div>
              </div>
              <Button to="/#contact">View contact details</Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
