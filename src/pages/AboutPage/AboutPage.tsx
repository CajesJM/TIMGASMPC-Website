import { Button } from "../../components/Button/Button";
import { PageHeader } from "../../components/PageHeader/PageHeader";
import { coreValues, objectives, socialGoals } from "../../data/content";
import styles from "./AboutPage.module.css";

const cooperativeName =
  "Tinabangay sa Igsoong Mag-uuma Gasa ni San Isidro Multi-Purpose Cooperative";

export function AboutPage() {
  return (
    <div id="about">
      <PageHeader
        headingLevel={2}
        eyebrow="About TIMGAS MPC"
        title="A strong and trusted cooperative."
        description="Established on July 25, 1995, TIMGAS MPC serves its members from Purok 5, Poblacion, Trinidad, Bohol, with the goal of improving their economic well-being through quality products and services."
      />

      <section className={`section ${styles.story}`}>
        <div className={`container ${styles.storyGrid}`}>
          <header className={styles.sectionHeading}>
            <p className="eyebrow">Our identity</p>
            <h2>Local roots and a shared purpose.</h2>
          </header>
          <div className={styles.storyContent}>
            <p className={styles.lead}>{cooperativeName}</p>
            <p>
              Commonly known as TIMGAS MPC, the cooperative was established on
              July 25, 1995. Its published vision, mission, objectives, core
              values, and social goals guide its work with members and the
              surrounding community.
            </p>
            <dl className={styles.facts}>
              <div>
                <dt>Established</dt>
                <dd>July 25, 1995</dd>
              </div>
              <div>
                <dt>Cooperative type</dt>
                <dd>Multi-purpose cooperative</dd>
              </div>
              <div>
                <dt>Office location</dt>
                <dd>Purok 5, Poblacion, Trinidad, Bohol</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className={`section ${styles.muted}`}>
        <div className={`container ${styles.purposeGrid}`}>
          <article>
            <p className="eyebrow">Our mission</p>
            <h2>Uplift every member’s economic status.</h2>
            <p>
              To uplift the economic status of every member by providing quality
              products and services.
            </p>
          </article>
          <article>
            <p className="eyebrow">Our vision</p>
            <h2>A strong and trusted cooperative.</h2>
            <p>
              A strong and trusted cooperative where members are progressive
              with pride and dignity.
            </p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <header className={styles.sectionHeading}>
            <p className="eyebrow">Our core values</p>
            <h2>The values behind TIMGAS.</h2>
          </header>
          <div className={styles.valueGrid}>
            {coreValues.map(([letter, value]) => (
              <article key={letter}>
                <strong>{letter}</strong>
                <span>{value}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={`section ${styles.muted}`}>
        <div className="container">
          <header className={styles.sectionHeading}>
            <p className="eyebrow">Our objectives</p>
            <h2>Building member and community self-reliance.</h2>
          </header>
          <ol className={styles.numberedList}>
            {objectives.map((objective) => (
              <li key={objective}>{objective}</li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <header className={styles.sectionHeading}>
            <p className="eyebrow">Our social goals</p>
            <h2>Working toward sustainable rural development.</h2>
          </header>
          <div className={styles.socialGrid}>
            {socialGoals.map((goal, index) => (
              <article key={goal}>
                <span aria-hidden="true">0{index + 1}</span>
                <p>{goal}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.cta}>
        <div className="container">
          <div>
            <h2>There is a place for you here.</h2>
            <p>Discover what TIMGAS MPC membership can help you build.</p>
          </div>
          <Button to="/#application" variant="light">
            Start your application
          </Button>
        </div>
      </section>
    </div>
  );
}
