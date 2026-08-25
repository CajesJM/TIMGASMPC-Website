import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "../../components/Button/Button";
import {
  PhotoCarousel,
  type CarouselPhoto,
} from "../../components/PhotoCarousel/PhotoCarousel";
import officeImage from "../../assets/images/Hero.png";
import officeFacadeImage from "../../assets/images/timgas-office-facade.jpg";
import roadsideSignImage from "../../assets/images/timgas-roadside-sign.jpg";
import frontView from "../../assets/images/Timgas.png";
import { principles } from "../../data/content";
import { AboutPage } from "../AboutPage/AboutPage";
import { ContactPage } from "../ContactPage/ContactPage";
import { CertificationsSection } from "../CertificationsSection/CertificationsSection";
import { MembershipPage } from "../MembershipPage/MembershipPage";
import { NewsPage } from "../NewsPage/NewsPage";
import styles from "./HomePage.module.css";

const officePhotos: CarouselPhoto[] = [
  {
    src: officeImage,
    alt: "Front entrance of the TIMGAS Multi-Purpose Cooperative office",
    caption: "TIMGAS cooperative office",
  },
  {
    src: officeFacadeImage,
    alt: "Upper facade and main sign of the TIMGAS MPC office",
    caption: "Office facade and main sign",
  },
  {
    src: roadsideSignImage,
    alt: "TIMGAS MPC roadside sign in Trinidad, Bohol",
    caption: "TIMGAS roadside sign",
  },
  {
    src: frontView,
    alt: "Front view of the TIMGAS MPC office",
    caption: "Front view of the office",
  },
];

export function HomePage() {
  return (
    <>
      <section id="home" className={styles.hero}>
        <img
          className={styles.heroImage}
          src={officeImage}
          alt="Front entrance of the TIMGAS Multi-Purpose Cooperative office in Trinidad, Bohol"
        />
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
