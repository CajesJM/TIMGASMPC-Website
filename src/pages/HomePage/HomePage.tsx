import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Download,
  Quote,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../components/Button/Button";
import { announcements, principles, services } from "../../data/content";
import heroImage from "../../assets/images/timgas-office-hero-v2.jpg";
import officeImage from "../../assets/images/timgas-office.jpg";
import styles from "./HomePage.module.css";

export function HomePage() {
  return (
    <>
      <section className={styles.hero}>
        <img
          className={styles.heroImage}
          src={heroImage}
          alt="TIMGAS Multi-Purpose Cooperative office in Trinidad, Bohol"
        />
        <div className={styles.heroOverlay} />
        <div className={`container ${styles.heroContent}`}>
          <p className={styles.kicker}>TIMGAS Multi-Purpose Cooperative</p>
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
            <Button to="/apply" variant="light">
              Become a member <ArrowRight size={18} />
            </Button>
            <Button
              to="/about"
              variant="secondary"
              className={styles.heroSecondary}
            >
              Discover our story
            </Button>
          </div>
        </div>
        <div className={styles.heroStats}>
          <div className="container">
            <p>
              <strong>Since 1995</strong>
              <span>Established July 25</span>
            </p>
            <p>
              <strong>31 years</strong>
              <span>Serving together</span>
            </p>
            <p>
              <strong>4</strong>
              <span>Service groups</span>
            </p>
          </div>
        </div>
      </section>

      <section className={`section ${styles.servicesSection}`}>
        <div className={`container ${styles.intro}`}>
          <div>
            <p className="eyebrow">Your cooperative advantage</p>
            <h2>Essential services in one convenient place.</h2>
          </div>
          <div>
            <p>
              TIMGAS provides in-office assistance for PSA civil registry
              documents, TrueMoney remittances, bills payment, and selected
              government transactions. Availability and requirements may vary.
            </p>
            <Link className={styles.textLink} to="/services">
              View all service details <ArrowRight size={17} />
            </Link>
          </div>
        </div>
        <div className={`container ${styles.serviceGrid}`}>
          {services.map(({ icon: Icon, title, description }, index) => (
            <article className={styles.service} key={title}>
              <Icon aria-hidden="true" />
              <span aria-hidden="true">0{index + 1}</span>
              <h3>{title}</h3>
              <p>{description}</p>
              <Link to="/services" aria-label={`Learn more about ${title}`}>
                <ChevronRight />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.impact}>
        <div className={`container ${styles.impactGrid}`}>
          <figure className={styles.impactPhoto}>
            <img
              src={officeImage}
              alt="Exterior of the TIMGAS Multi-Purpose Cooperative office"
            />
            <figcaption>
              <span>Established</span>
              <time dateTime="1995-07-25">July 25, 1995</time>
            </figcaption>
          </figure>
          <div className={styles.impactCopy}>
            <p className="eyebrow">Community purpose, close to home</p>
            <h2>A long-standing partner in financial growth.</h2>
            <p>
              Established on July 25, 1995, TIMGAS MPC continues to pursue its
              mission of uplifting every member’s economic status through
              quality products and services. Its published objectives include:
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
            <Button to="/services">
              Explore cooperative services <ArrowRight size={18} />
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
            Our cooperative principles shape every decision—from how we serve
            one member to how we plan for the whole community.
          </p>
        </div>
        <div className={`container ${styles.principles}`}>
          {principles.map(([title, description], index) => (
            <article key={title}>
              <span>0{index + 1}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.testimonial}>
        <div className={`container ${styles.quote}`}>
          <Quote aria-hidden="true" />
          <blockquote>
            “Through the cooperative, I was able to prepare for planting on time
            and sell our harvest with more confidence. You feel that you are
            building something with your neighbors, not doing it alone.”
          </blockquote>
          <p>
            <strong>Maria L.</strong>
            <span>Member-farmer since 2016</span>
          </p>
        </div>
      </section>

      <section className="section">
        <div className={`container ${styles.newsHeading}`}>
          <div>
            <p className="eyebrow">Latest from TIMGAS</p>
            <h2>News & notices</h2>
          </div>
          <Link className={styles.textLink} to="/news">
            View all updates <ArrowRight size={17} />
          </Link>
        </div>
        <div className={`container ${styles.newsGrid}`}>
          {announcements.map((item) => (
            <article key={item.id}>
              <div>
                <span>{item.category}</span>
                <time>{item.date}</time>
              </div>
              <h3>{item.title}</h3>
              <p>{item.excerpt}</p>
              <Link to="/news">
                Read update <ArrowRight size={16} />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.download}>
        <div className={`container ${styles.downloadInner}`}>
          <div>
            <p className="eyebrow">Ready to get started?</p>
            <h2>Your cooperative journey begins here.</h2>
            <p>
              Apply online or download the membership form and visit our office.
              Our team is ready to guide you.
            </p>
          </div>
          <div>
            <Button to="/apply" variant="light">
              Apply online <ArrowRight size={18} />
            </Button>
            <a href="/application-form.pdf" download>
              <Download size={18} /> Download application form
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
