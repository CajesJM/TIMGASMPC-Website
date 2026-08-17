import { ArrowRight, CheckCircle2, Download } from "lucide-react";
import { Button } from "../../components/Button/Button";
import { PageHeader } from "../../components/PageHeader/PageHeader";
import {
  membershipBenefits,
  membershipRequirements,
  membershipSteps,
} from "../../data/content";
import styles from "../shared/ContentPage.module.css";
import pageStyles from "./MembershipPage.module.css";

export function MembershipPage() {
  return (
    <>
      <PageHeader
        eyebrow="Membership"
        title="Build with us, grow with us."
        description="Joining TIMGAS means sharing in the resources, decisions, and rewards of a member-owned cooperative. Here is everything you need to get started."
      />
      <section className="section">
        <div className={`container ${styles.split}`}>
          <div>
            <p className="eyebrow">How to join</p>
            <h2>Four simple steps to membership.</h2>
          </div>
          <div>
            <p className={styles.lead}>
              Membership is open to individuals who meet the cooperative's
              eligibility requirements and are willing to take part in the
              shared responsibility of the cooperative.
            </p>
            <div className={styles.steps}>
              {membershipSteps.map(([title, description]) => (
                <div key={title}>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className={`section ${styles.muted}`}>
        <div className="container">
          <p className="eyebrow">Basic requirements</p>
          <h2>Prepare these documents.</h2>
          <ul className={pageStyles.requirements}>
            {membershipRequirements.map((requirement) => (
              <li key={requirement}>
                <CheckCircle2 aria-hidden="true" />
                {requirement}
              </li>
            ))}
          </ul>
          <p className={pageStyles.note}>
            Additional documents may be requested depending on the program you
            are applying for. Share capital amounts and fees are set by the
            General Assembly—contact the office for the current rates.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <p className="eyebrow">Member benefits</p>
          <h2>What membership gives you.</h2>
          <div className={styles.threeGrid}>
            {membershipBenefits.map((benefit) => (
              <article key={benefit}>
                <h3>{benefit}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className={styles.cta}>
        <div className="container">
          <div>
            <h2>Ready to become a member?</h2>
            <p>Apply online or download the form and bring it to our office.</p>
          </div>
          <div className={pageStyles.ctaActions}>
            <Button to="/apply" variant="light">
              Apply online <ArrowRight size={18} />
            </Button>
            <a
              className={pageStyles.download}
              href="/application-form.pdf"
              download
            >
              <Download size={18} /> Download application form
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
