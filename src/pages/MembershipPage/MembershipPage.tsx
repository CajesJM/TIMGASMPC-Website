import {
  ArrowRight,
  FileDown,
  FilePenLine,
  HandCoins,
  UsersRound,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { LoanApplicationForm } from "../../components/application/LoanApplicationForm/LoanApplicationForm";
import { MembershipApplicationForm } from "../../components/application/MembershipApplicationForm/MembershipApplicationForm";
import { ApplicationModal } from "../../components/application/MembershipApplicationModal/MembershipApplicationModal";
import { ApplicationProcess } from "../../components/ApplicationProcess/ApplicationProcess";
import { RecaptchaGate } from "../../components/security/RecaptchaGate/RecaptchaGate";
import { Button } from "../../components/Button/Button";
import { PageHeader } from "../../components/PageHeader/PageHeader";
import styles from "../shared/ContentPage.module.css";
import pageStyles from "./MembershipPage.module.css";

const verificationSteps = [
  "Ask the TIMGAS office to confirm current membership eligibility.",
  "Request the latest document, orientation, and application requirements.",
  "Confirm the current share capital, fees, and accepted payment methods.",
  "Submit only after cooperative staff confirm that your application is complete.",
];

type ApplicationTarget = "membership" | "loan";
type CaptchaCredential = { token: string; verifiedAt: number };
type PendingCaptcha = {
  target: ApplicationTarget;
  resolve: (token: string) => void;
  reject: (error: Error) => void;
};

const maximumCachedCaptchaAge = 90_000;

export function MembershipPage() {
  const [showOnlineForm, setShowOnlineForm] = useState(false);
  const [onlineFormLoaded, setOnlineFormLoaded] = useState(false);
  const [showLoanForm, setShowLoanForm] = useState(false);
  const [loanFormLoaded, setLoanFormLoaded] = useState(false);
  const [captchaTarget, setCaptchaTarget] = useState<ApplicationTarget | null>(null);
  const [captchaPurpose, setCaptchaPurpose] = useState<"opening" | "submitting">(
    "opening",
  );
  const [captchaCredentials, setCaptchaCredentials] = useState<
    Partial<Record<ApplicationTarget, CaptchaCredential>>
  >({});
  const pendingCaptchaRef = useRef<PendingCaptcha | null>(null);

  const openOnlineForm = () => {
    setOnlineFormLoaded(true);
    setShowOnlineForm(true);
  };

  const openLoanForm = () => {
    setLoanFormLoaded(true);
    setShowLoanForm(true);
  };

  const requestOpeningCaptcha = (target: ApplicationTarget) => {
    setCaptchaPurpose("opening");
    setCaptchaTarget(target);
  };

  const completeCaptcha = useCallback((token: string) => {
    if (!captchaTarget || !token) return;
    const target = captchaTarget;
    setCaptchaTarget(null);

    const pendingCaptcha = pendingCaptchaRef.current;
    if (pendingCaptcha?.target === target) {
      pendingCaptchaRef.current = null;
      pendingCaptcha.resolve(token);
      return;
    }

    setCaptchaCredentials((current) => ({
      ...current,
      [target]: { token, verifiedAt: Date.now() },
    }));
    if (target === "membership") openOnlineForm();
    else openLoanForm();
  }, [captchaTarget]);

  const closeCaptcha = useCallback(() => {
    const pendingCaptcha = pendingCaptchaRef.current;
    if (pendingCaptcha && pendingCaptcha.target === captchaTarget) {
      pendingCaptchaRef.current = null;
      pendingCaptcha.reject(
        new Error("Security verification was cancelled. Complete it to submit your application."),
      );
    }
    setCaptchaTarget(null);
  }, [captchaTarget]);

  const getRecaptchaToken = useCallback(
    (target: ApplicationTarget) => {
      const credential = captchaCredentials[target];
      if (
        credential &&
        Date.now() - credential.verifiedAt <= maximumCachedCaptchaAge
      ) {
        setCaptchaCredentials((current) => ({
          ...current,
          [target]: undefined,
        }));
        return Promise.resolve(credential.token);
      }

      return new Promise<string>((resolve, reject) => {
        pendingCaptchaRef.current = { target, resolve, reject };
        setCaptchaPurpose("submitting");
        setCaptchaTarget(target);
      });
    },
    [captchaCredentials],
  );

  return (
    <div id="membership">
      <PageHeader
        headingLevel={2}
        eyebrow="Membership"
        title="Begin your TIMGAS membership inquiry."
        description="Membership policies, requirements, share capital, fees, and approval procedures may change. Confirm the current process directly with the TIMGAS MPC office before submitting."
        centered
      />

      <ApplicationProcess
        eyebrow="Before applying"
        title="Start with verified information."
        description="The cooperative office is the authoritative source for current membership rules and application requirements."
        steps={verificationSteps}
      />

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
                <button type="button" onClick={() => requestOpeningCaptcha("membership")}>
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
                <button type="button" onClick={() => requestOpeningCaptcha("loan")}>
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
          <MembershipApplicationForm
            getRecaptchaToken={() => getRecaptchaToken("membership")}
          />
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
          <LoanApplicationForm
            getRecaptchaToken={() => getRecaptchaToken("loan")}
          />
        </ApplicationModal>
      )}

      {captchaTarget && (
        <RecaptchaGate
          applicationName={captchaTarget === "loan" ? "loan application" : "membership application"}
          open
          purpose={captchaPurpose}
          onClose={closeCaptcha}
          onVerified={completeCaptcha}
        />
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
