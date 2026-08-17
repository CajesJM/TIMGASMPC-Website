import { Button } from "../../components/Button/Button";
import { PageHeader } from "../../components/PageHeader/PageHeader";
import { coreValues, objectives, socialGoals } from "../../data/content";
import styles from "../shared/ContentPage.module.css";

export function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About TIMGAS"
        title="Progress with people at the center."
        description="We are a member-owned cooperative committed to building stronger livelihoods, responsible growth, and lasting community value."
      />
      <section className="section">
        <div className={`container ${styles.split}`}>
          <div>
            <p className="eyebrow">Our story</p>
            <h2>Local roots. A shared direction.</h2>
          </div>
          <div>
            <p className={styles.lead}>
              TIMGAS Multi-Purpose Cooperative began with a simple belief:
              people can achieve more when resources, responsibility, and
              opportunity are shared.
            </p>
            <p>
              From a small group of community members, we have grown into a
              trusted local institution serving farmers, families, and
              entrepreneurs. We remain guided by the same democratic values that
              shaped our beginning.
            </p>
            <div className={styles.facts}>
              <div>
                <strong>July 25, 1995</strong>
                <span>Registered and established</span>
              </div>
              <div>
                <strong>31 years</strong>
                <span>Serving the community</span>
              </div>
              <div>
                <strong>Member-owned</strong>
                <span>Locally governed cooperative</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className={`section ${styles.muted}`}>
        <div className={`container ${styles.twoGrid}`}>
          <article>
            <p className="eyebrow">Our mission</p>
            <h3>Uplift every member’s economic status.</h3>
            <p>
              To uplift the economic status of every member by providing quality
              products and services.
            </p>
          </article>
          <article>
            <p className="eyebrow">Our vision</p>
            <h3>A strong and trusted cooperative.</h3>
            <p>
              A strong and trusted cooperative where members are progressive
              with pride and dignity.
            </p>
          </article>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <p className="eyebrow">Our core values</p>
          <h2>The values behind TIMGAS.</h2>
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
          <p className="eyebrow">Our objectives</p>
          <h2>Building member and community self-reliance.</h2>
          <ol className={styles.numberedList}>
            {objectives.map((objective) => (
              <li key={objective}>{objective}</li>
            ))}
          </ol>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <p className="eyebrow">Our social goals</p>
          <h2>Strengthening the cooperative for sustainable development.</h2>
          <div className={styles.twoGrid}>
            {socialGoals.map((goal) => (
              <article key={goal}>
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
            <p>Discover what membership can help you build.</p>
          </div>
          <Button to="/apply" variant="light">
            Start your application
          </Button>
        </div>
      </section>
    </>
  );
}
