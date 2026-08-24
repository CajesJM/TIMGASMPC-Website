import { useOutletContext } from "react-router-dom";
import { AdminApplicationsManager } from "../../../components/admin/AdminApplicationsManager/AdminApplicationsManager";
import { AdminLoanApplicationsManager } from "../../../components/admin/AdminLoanApplicationsManager/AdminLoanApplicationsManager";
import type { ManagerOutletContext } from "../../../layouts/admin/ManagerLayout/ManagerLayout";
import pageStyles from "../../../styles/admin/AdminPage.module.css";
import styles from "./ManagerApplicationsPage.module.css";
import { useState } from "react";

export function ManagerApplicationsPage() {
  const { showToast } = useOutletContext<ManagerOutletContext>();
  const [applicationType, setApplicationType] = useState<"membership" | "loan">("membership");

  return (
    <div className={pageStyles.content}>
      <div className={pageStyles.welcome}>
        <div>
          <p className="eyebrow">Easy Apply</p>
          <h1>Application records</h1>
          <p>
            Review private membership and loan submissions, verify applicant
            information, and record cooperative decisions.
          </p>
        </div>
      </div>
      <div className={styles.tabs} role="tablist" aria-label="Application type">
        <button
          type="button"
          role="tab"
          aria-selected={applicationType === "membership"}
          className={applicationType === "membership" ? styles.active : undefined}
          onClick={() => setApplicationType("membership")}
        >
          Membership applications
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={applicationType === "loan"}
          className={applicationType === "loan" ? styles.active : undefined}
          onClick={() => setApplicationType("loan")}
        >
          Loan applications
        </button>
      </div>
      <div role="tabpanel">
        {applicationType === "membership" ? (
          <AdminApplicationsManager showToast={showToast} />
        ) : (
          <AdminLoanApplicationsManager showToast={showToast} />
        )}
      </div>
    </div>
  );
}
