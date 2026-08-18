import { ArrowRight, Building2, CheckCircle2, FileDown, FilePenLine } from "lucide-react";
import { Button } from "../../components/Button/Button";
import { PageHeader } from "../../components/PageHeader/PageHeader";
import { objectives } from "../../data/content";
import styles from "../shared/ContentPage.module.css";
import pageStyles from "./MembershipPage.module.css";

const verificationSteps = [
  "Ask the TIMGAS office to confirm current membership eligibility.",
  "Request the latest document, orientation, and application requirements.",
  "Confirm the current share capital, fees, and accepted payment methods.",
  "Submit only after cooperative staff confirm that your application is complete.",
];

export function MembershipPage() {
  return (
    <div id="membership">
      <PageHeader
        headingLevel={2}
        eyebrow="Membership"
        title="Begin your TIMGAS membership inquiry."
        description="Membership policies, requirements, share capital, fees, and approval procedures may change. Confirm the current process directly with the TIMGAS MPC office before submitting."
      />

      <section className={styles.section}>
        <div className={`container ${styles.split}`}>
          <header className={styles.sectionHeading}>
            <p className="eyebrow">Before applying</p>
            <h2>Start with verified information.</h2>
            <p>
              The cooperative office is the authoritative source for current
              membership rules and application requirements.
            </p>
          </header>
          <ol className={styles.steps}>
            {verificationSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
      </section>

      <section className={`${styles.section} ${styles.muted}`}>
        <div className="container">
          <header className={styles.sectionHeading}>
            <p className="eyebrow">Published objectives</p>
            <h2>What TIMGAS MPC works toward for members.</h2>
          </header>
          <div className={pageStyles.objectiveGrid}>
            {objectives.slice(0, 4).map((objective) => (
              <article key={objective}>
                <CheckCircle2 aria-hidden="true" />
                <p>{objective}</p>
              </article>
            ))}
          </div>
          <aside className={pageStyles.note}>
            <Building2 aria-hidden="true" />
            <p>
              These are cooperative objectives, not guaranteed individual
              benefits. Program eligibility and availability must be confirmed
              with TIMGAS MPC.
            </p>
          </aside>
        </div>
      </section>

      <section id="application" className={pageStyles.applicationSection}>
        <div className="container">
          <header className={styles.sectionHeading}>
            <p className="eyebrow">Application options</p>
            <h2>Choose how you want to complete the official form.</h2>
            <p>
              TIMGAS MPC will support online completion and a downloadable
              form for applicants who prefer to fill it out manually.
            </p>
          </header>
          <div className={pageStyles.applicationGrid}>
            <article>
              <FilePenLine aria-hidden="true" />
              <div>
                <span>Online option</span>
                <h3>Fill out the application online</h3>
                <p>
                  Complete the official application through the website once
                  the manager confirms all required fields.
                </p>
              </div>
              <button type="button" disabled>Official format pending</button>
            </article>
            <article>
              <FileDown aria-hidden="true" />
              <div>
                <span>Manual option</span>
                <h3>Download and fill out the form</h3>
                <p>
                  Download the official file, complete it manually, and submit
                  it according to the cooperative office’s instructions.
                </p>
              </div>
              <button type="button" disabled>Download pending</button>
            </article>
          </div>
          <aside className={pageStyles.pendingNotice}>
            <Building2 aria-hidden="true" />
            <p>
              The manager has confirmed both application methods, but the
              official form format has not yet been provided. No unofficial
              online form or downloadable document is being published.
            </p>
          </aside>
        </div>
      </section>

      <section className={styles.cta}>
        <div className="container">
          <div>
            <h2>Ready to ask about membership?</h2>
            <p>Contact the office while the official application format is being prepared.</p>
          </div>
          <div className={pageStyles.ctaActions}>
            <Button to="/#contact" variant="light">
              Contact the office <ArrowRight size={18} />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
