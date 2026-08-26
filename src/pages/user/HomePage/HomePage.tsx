import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/shared/Button/Button";
import {
  PhotoCarousel,
  type CarouselPhoto,
} from "@/components/user/home/PhotoCarousel/PhotoCarousel";
import officeImage from "@/assets/images/website/Hero.png";
import hero640Avif from "@/assets/images/website/optimized/hero-640.avif";
import hero960Avif from "@/assets/images/website/optimized/hero-960.avif";
import hero1440Avif from "@/assets/images/website/optimized/hero-1440.avif";
import hero640Webp from "@/assets/images/website/optimized/hero-640.webp";
import hero960Webp from "@/assets/images/website/optimized/hero-960.webp";
import hero1440Webp from "@/assets/images/website/optimized/hero-1440.webp";
import officeFacadeImage from "@/assets/images/office/timgas-office-facade.jpg";
import officeFacade640Avif from "@/assets/images/office/optimized/office-facade-640.avif";
import officeFacade960Avif from "@/assets/images/office/optimized/office-facade-960.avif";
import officeFacade1440Avif from "@/assets/images/office/optimized/office-facade-1440.avif";
import officeFacade640Webp from "@/assets/images/office/optimized/office-facade-640.webp";
import officeFacade960Webp from "@/assets/images/office/optimized/office-facade-960.webp";
import officeFacade1440Webp from "@/assets/images/office/optimized/office-facade-1440.webp";
import roadsideSignImage from "@/assets/images/office/timgas-roadside-sign.jpg";
import roadsideSign640Avif from "@/assets/images/office/optimized/roadside-sign-640.avif";
import roadsideSign960Avif from "@/assets/images/office/optimized/roadside-sign-960.avif";
import roadsideSign1440Avif from "@/assets/images/office/optimized/roadside-sign-1440.avif";
import roadsideSign640Webp from "@/assets/images/office/optimized/roadside-sign-640.webp";
import roadsideSign960Webp from "@/assets/images/office/optimized/roadside-sign-960.webp";
import roadsideSign1440Webp from "@/assets/images/office/optimized/roadside-sign-1440.webp";
import frontView from "@/assets/images/website/Timgas.png";
import frontView640Avif from "@/assets/images/website/optimized/front-view-640.avif";
import frontView960Avif from "@/assets/images/website/optimized/front-view-960.avif";
import frontView1440Avif from "@/assets/images/website/optimized/front-view-1440.avif";
import frontView640Webp from "@/assets/images/website/optimized/front-view-640.webp";
import frontView960Webp from "@/assets/images/website/optimized/front-view-960.webp";
import frontView1440Webp from "@/assets/images/website/optimized/front-view-1440.webp";
import { principles } from "@/data/content";
import { AboutPage } from "@/pages/user/AboutPage/AboutPage";
import { ContactPage } from "@/pages/user/ContactPage/ContactPage";
import { CertificationsSection } from "@/components/user/home/CertificationsSection/CertificationsSection";
import { MembershipPage } from "@/pages/user/MembershipPage/MembershipPage";
import { NewsPage } from "@/pages/user/NewsPage/NewsPage";
import styles from "@/styles/user/pages/HomePage.module.css";

const officePhotos: CarouselPhoto[] = [
  {
    src: officeImage,
    avifSrcSet: `${hero640Avif} 640w, ${hero960Avif} 960w, ${hero1440Avif} 1440w`,
    webpSrcSet: `${hero640Webp} 640w, ${hero960Webp} 960w, ${hero1440Webp} 1440w`,
    alt: "Front entrance of the TIMGAS Multi-Purpose Cooperative office",
    caption: "TIMGAS cooperative office",
    width: 1536,
    height: 1024,
  },
  {
    src: officeFacadeImage,
    avifSrcSet: `${officeFacade640Avif} 640w, ${officeFacade960Avif} 960w, ${officeFacade1440Avif} 1440w`,
    webpSrcSet: `${officeFacade640Webp} 640w, ${officeFacade960Webp} 960w, ${officeFacade1440Webp} 1440w`,
    alt: "Upper facade and main sign of the TIMGAS MPC office",
    caption: "Office facade and main sign",
    width: 1600,
    height: 1200,
  },
  {
    src: roadsideSignImage,
    avifSrcSet: `${roadsideSign640Avif} 640w, ${roadsideSign960Avif} 960w, ${roadsideSign1440Avif} 1440w`,
    webpSrcSet: `${roadsideSign640Webp} 640w, ${roadsideSign960Webp} 960w, ${roadsideSign1440Webp} 1440w`,
    alt: "TIMGAS MPC roadside sign in Trinidad, Bohol",
    caption: "TIMGAS roadside sign",
    width: 1600,
    height: 1200,
  },
  {
    src: frontView,
    avifSrcSet: `${frontView640Avif} 640w, ${frontView960Avif} 960w, ${frontView1440Avif} 1440w`,
    webpSrcSet: `${frontView640Webp} 640w, ${frontView960Webp} 960w, ${frontView1440Webp} 1440w`,
    alt: "Front view of the TIMGAS MPC office",
    caption: "Front view of the office",
    width: 1536,
    height: 1024,
  },
];

export function HomePage() {
  return (
    <>
      <section id="home" className={styles.hero}>
        <picture className={styles.heroMedia}>
          <source
            type="image/avif"
            srcSet={`${hero640Avif} 640w, ${hero960Avif} 960w, ${hero1440Avif} 1440w`}
            sizes="(max-width: 40rem) 100vw, 75vw"
          />
          <source
            type="image/webp"
            srcSet={`${hero640Webp} 640w, ${hero960Webp} 960w, ${hero1440Webp} 1440w`}
            sizes="(max-width: 40rem) 100vw, 75vw"
          />
          <img
            className={styles.heroImage}
            src={officeImage}
            alt="Front entrance of the TIMGAS Multi-Purpose Cooperative office in Trinidad, Bohol"
            width="1536"
            height="1024"
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
        </picture>
        <div className={styles.heroOverlay} aria-hidden="true" />
        <div className={`container ${styles.heroContent}`}>
          <p className={styles.kicker}>TIMGAS Multi Purpose Cooperative</p>
          <h1 aria-label="Your partner in financial growth.">
            Your partner in
            <br />
            <em>financial growth.</em>
          </h1>
          <p>
            We help members build secure livelihoods through responsible
            financial services, farm support, and the power of cooperation.
          </p>
          <div className={styles.heroActions}>
            <Button to="/#membership">
              Become a member <ArrowRight size={18} />
            </Button>
            <Button
              to="/#about"
              variant="secondary"
              className={styles.heroSecondary}
            >
              Discover our story
            </Button>
          </div>
        </div>
        <div className={styles.heroCurve} aria-hidden="true">
          <svg
            viewBox="0 0 1440 130"
            preserveAspectRatio="none"
            focusable="false"
          >
            <path d="M0 25C210 83 390 96 620 40C820-9 980 78 1198 49C1305 35 1375 24 1440 34V130H0V25Z" />
          </svg>
        </div>
      </section>

      <section className={styles.impact}>
        <div className={`container ${styles.impactGrid}`}>
          <PhotoCarousel
            ariaLabel="TIMGAS office photo gallery"
            photos={officePhotos}
          />
          <div className={styles.impactCopy}>
            <p className="eyebrow">Community purpose, close to home</p>
            <h2>A long-standing partner in financial growth.</h2>
            <p>
              Established on July 25, 1995, TIMGAS MPC works to uplift the
              economic status of its members through quality products and
              services. Its published objectives include:
            </p>
            <ul>
              <li>
                <CheckCircle2 /> Financial support for members seeking
                additional business capital and income opportunities
              </li>
              <li>
                <CheckCircle2 /> Development of self-help and self-employment
                capacity among individual members
              </li>
              <li>
                <CheckCircle2 /> An alternative banking option for underserved
                communities
              </li>
            </ul>
            <Button to="/#about">
              Learn about the cooperative <ArrowRight size={18} />
            </Button>
          </div>
        </div>
      </section>

      <section className="section">
        <div className={`container ${styles.valuesHeader}`}>
          <div>
            <p className="eyebrow">What guides us</p>
            <h2>Built on trust. Driven by purpose.</h2>
          </div>
          <p>
            These cooperative principles guide TIMGAS MPC in delivering member
            savings, responsible loan support, and community-rooted services
            that help families and local livelihoods grow.
          </p>
        </div>
        <div className={`container ${styles.principles}`}>
          {principles.map(([title, description]) => (
            <article key={title}>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.download}>
        <div className={`container ${styles.downloadInner}`}>
          <div>
            <p className="eyebrow">Ready to get started?</p>
            <h2>Your cooperative journey begins with an inquiry.</h2>
            <p>
              Contact TIMGAS MPC for the current membership process, or review
              the available application methods before visiting the office.
            </p>
          </div>
          <div>
            <Button to="/#application" variant="light">
              View application options <ArrowRight size={18} />
            </Button>
          </div>
        </div>
      </section>

      <AboutPage />
      <CertificationsSection />
      <MembershipPage />
      <NewsPage />
      <ContactPage />
    </>
  );
}
