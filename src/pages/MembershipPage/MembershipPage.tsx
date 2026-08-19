import {
  ArrowRight,
  Building2,
  CheckCircle2,
  FileDown,
  FilePenLine,
} from "lucide-react";
import { useState } from "react";
import { MembershipApplicationForm } from "../../components/application/MembershipApplicationForm/MembershipApplicationForm";
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
  const [showOnlineForm, setShowOnlineForm] = useState(false);

  const openOnlineForm = () => {
    setShowOnlineForm(true);
    window.requestAnimationFrame(() => {
      const form = document.getElementById("online-application");
      if (typeof form?.scrollIntoView === "function") {
        form.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  };

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
              TIMGAS MPC will support online completion and a downloadable form
              for applicants who prefer to fill it out manually.
            </p>
          </header>
          <div className={pageStyles.applicationGrid}>
            <article>
              <FilePenLine aria-hidden="true" />
              <div>
                <span>Online option</span>
                <h3>Fill out the application online</h3>
                <p>
                  Enter the information from the revised 2023 form and send it
                  securely to the manager for review.
                </p>
              </div>
              <button type="button" onClick={openOnlineForm}>
                {showOnlineForm
                  ? "Continue online application"
                  : "Apply online"}
              </button>
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
              <a
                href="/downloads/Membership-Application-Form-Revised-2023.docx"
                download
              >
                Download official form <FileDown aria-hidden="true" />
              </a>
            </article>
          </div>

          {showOnlineForm && <MembershipApplicationForm />}
        </div>
      </section>

      <section className={styles.cta}>
        <div className="container">
          <div>
            <h2>Need help with your application?</h2>
            <p>
              Contact the TIMGAS MPC office to confirm requirements or request
              assistance before submitting.
            </p>
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
