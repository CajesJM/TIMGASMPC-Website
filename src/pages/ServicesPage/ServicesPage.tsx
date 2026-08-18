import { Button } from "../../components/Button/Button";
import { PageHeader } from "../../components/PageHeader/PageHeader";
import { services } from "../../data/content";
import styles from "../shared/ContentPage.module.css";

const visitSteps = [
  [
    "Confirm availability",
    "Contact or visit TIMGAS MPC to confirm that the service is currently available.",
  ],
  [
    "Check requirements",
    "Ask which valid IDs, records, reference numbers, or supporting documents are needed.",
  ],
  [
    "Follow office guidance",
    "Processing steps and completion times depend on the service provider and current requirements.",
  ],
];

export function ServicesPage() {
  return (
    <div id="services">
      <PageHeader
        headingLevel={2}
        eyebrow="Available office services"
        title="Practical services in one local office."
        description="TIMGAS MPC provides office assistance for PSA civil registry documents, TrueMoney remittances, bills payment, and selected government transactions."
      />

      <section className={styles.section}>
        <div className={`container ${styles.serviceGrid}`}>
          {services.map(({ icon: Icon, title, description, items }, index) => (
            <article className={styles.serviceItem} key={title}>
              <div className={styles.serviceIcon}>
                <Icon aria-hidden="true" />
                <span aria-hidden="true">0{index + 1}</span>
              </div>
              <div>
                <h2>{title}</h2>
                <p>{description}</p>
                <ul className={styles.serviceDetails}>
                  {items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={`${styles.section} ${styles.muted}`}>
        <div className="container">
          <header className={styles.sectionHeading}>
            <p className="eyebrow">Before your visit</p>
            <h2>Prepare for a smoother transaction.</h2>
          </header>
          <div className={styles.infoGrid}>
            {visitSteps.map(([title, description], index) => (
              <article key={title}>
                <span aria-hidden="true">0{index + 1}</span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.cta}>
        <div className="container">
          <div>
            <h2>Need current service information?</h2>
            <p>Contact the TIMGAS MPC office before making your visit.</p>
          </div>
          <Button to="/#contact" variant="light">
            Contact the office
          </Button>
        </div>
      </section>
    </div>
  );
}
