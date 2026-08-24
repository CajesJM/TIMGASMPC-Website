import {
  ArrowRight,
  Building2,
  CheckCircle2,
  FileDown,
  FilePenLine,
  HandCoins,
  UsersRound,
} from "lucide-react";
import { useState } from "react";
import { LoanApplicationForm } from "../../components/application/LoanApplicationForm/LoanApplicationForm";
import { MembershipApplicationForm } from "../../components/application/MembershipApplicationForm/MembershipApplicationForm";
import { ApplicationModal } from "../../components/application/MembershipApplicationModal/MembershipApplicationModal";
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
  const [onlineFormLoaded, setOnlineFormLoaded] = useState(false);
  const [showLoanForm, setShowLoanForm] = useState(false);
  const [loanFormLoaded, setLoanFormLoaded] = useState(false);

  const openOnlineForm = () => {
    setOnlineFormLoaded(true);
    setShowOnlineForm(true);
  };

  const openLoanForm = () => {
    setLoanFormLoaded(true);
    setShowLoanForm(true);
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
            <p className="eyebrow">Application center</p>
            <h2>Choose the official application you need.</h2>
            <p>
              Complete a form online for manager review or download the
              original file and submit it according to office instructions.
            </p>
          </header>
          <div className={pageStyles.applicationGrid}>
            <article>
              <div className={pageStyles.applicationTitle}>
                <UsersRound aria-hidden="true" />
                <div>
                  <span>Membership</span>
                  <h3>Membership application</h3>
                </div>
              </div>
              <div className={pageStyles.applicationCopy}>
                <p>
                  Apply to become a TIMGAS MPC member using the official revised
                  2023 membership profile and agreement.
                </p>
              </div>
              <div className={pageStyles.applicationActions}>
                <button type="button" onClick={openOnlineForm}>
                  <FilePenLine /> {onlineFormLoaded ? "Continue online" : "Apply online"}
                </button>
                <a href="/downloads/Membership-Application-Form-Revised-2023.docx" download>
                  <FileDown /> Download form
                </a>
              </div>
            </article>
            <article>
              <div className={pageStyles.applicationTitle}>
                <HandCoins aria-hidden="true" />
                <div>
                  <span>Credit application</span>
                  <h3>Loan application</h3>
                </div>
              </div>
              <div className={pageStyles.applicationCopy}>
                <p>
                  Existing members can submit the official loan application for
                  manager assessment and cooperative approval.
                </p>
              </div>
              <div className={pageStyles.applicationActions}>
                <button type="button" onClick={openLoanForm}>
                  <FilePenLine /> {loanFormLoaded ? "Continue loan form" : "Apply for a loan"}
                </button>
                <a href="/downloads/Loan-Application-Form.xls" download>
                  <FileDown /> Download XLS
                </a>
              </div>
            </article>
          </div>

        </div>
      </section>

      {onlineFormLoaded && (
        <ApplicationModal
          open={showOnlineForm}
          onClose={() => setShowOnlineForm(false)}
          eyebrow="Membership application"
          title="Apply online to TIMGAS MPC"
          description="Complete each section, review your information, then submit it privately to the cooperative manager."
          closeLabel="Close membership application"
          idPrefix="membership"
        >
          <MembershipApplicationForm />
        </ApplicationModal>
      )}

      {loanFormLoaded && (
        <ApplicationModal
          open={showLoanForm}
          onClose={() => setShowLoanForm(false)}
          eyebrow="Official loan application"
          title="Apply for a TIMGAS MPC loan"
          description="Complete the fields from the official Excel form. Internal assessment and approval sections are completed by authorized TIMGAS personnel."
          closeLabel="Close loan application"
          idPrefix="loan"
        >
          <LoanApplicationForm />
        </ApplicationModal>
      )}

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
