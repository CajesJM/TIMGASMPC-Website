import {
  collection,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { CircleCheckBig, Clock3, FileText, Inbox } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "../../../lib/firestore";
import {
  loanStatusLabels,
  loanTypeLabels,
  type LoanStatus,
  type LoanType,
} from "../../../features/applications/loanApplicationTypes";
import pageStyles from "../../../styles/admin/AdminPage.module.css";
import styles from "./DashboardPage.module.css";

type ApplicationStatus = LoanStatus;

type Application = {
  id: string;
  reference: string;
  applicantName: string;
  applicationType: string;
  applicationGroup: "membership" | "loan";
  submittedAt: Timestamp | null;
  status: ApplicationStatus;
};

type DashboardMetrics = {
  totalApplications: number;
  newApplications: number;
  inProgress: number;
  approved: number;
};

const emptyMetrics: DashboardMetrics = {
  totalApplications: 0,
  newApplications: 0,
  inProgress: 0,
  approved: 0,
};

const statusLabels: Record<ApplicationStatus, string> = {
  ...loanStatusLabels,
};

const statusClassNames: Record<ApplicationStatus, string> = {
  new: "new",
  in_review: "inreview",
  for_verification: "forverification",
  approved: "approved",
  disapproved: "disapproved",
  released: "released",
};

const pipelineStatuses: ApplicationStatus[] = [
  "new",
  "in_review",
  "for_verification",
  "approved",
  "disapproved",
  "released",
];

function isApplicationStatus(value: unknown): value is ApplicationStatus {
  return typeof value === "string" && value in statusLabels;
}

function isLoanType(value: unknown): value is LoanType {
  return typeof value === "string" && value in loanTypeLabels;
}

function formatSubmittedAt(value: Timestamp | null) {
  if (!value) return "Date unavailable";
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value.toDate());
}

export function DashboardPage() {
  const [metrics, setMetrics] = useState(emptyMetrics);
  const [pipeline, setPipeline] = useState<Record<ApplicationStatus, number>>({
    new: 0,
    in_review: 0,
    for_verification: 0,
    approved: 0,
    disapproved: 0,
    released: 0,
  });
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(Boolean(db));
  const [loadError, setLoadError] = useState(
    db ? "" : "Firebase is not configured for this environment.",
  );
  useEffect(() => {
    if (!db) return;

    const firestore = db;
    const loadDashboard = async () => {
      try {
        const membershipRef = collection(firestore, "applications");
        const loanRef = collection(firestore, "loanApplications");
        const countStatus = async (status: ApplicationStatus) => {
          const [membership, loan] = await Promise.all([
            getCountFromServer(query(membershipRef, where("status", "==", status))),
            getCountFromServer(query(loanRef, where("status", "==", status))),
          ]);
          return membership.data().count + loan.data().count;
        };

        const [totalMembership, totalLoans, statusCounts, membershipRecent, loanRecent] =
          await Promise.all([
            getCountFromServer(membershipRef),
            getCountFromServer(loanRef),
            Promise.all(pipelineStatuses.map(countStatus)),
            getDocs(query(membershipRef, orderBy("submittedAt", "desc"), limit(6))),
            getDocs(query(loanRef, orderBy("submittedAt", "desc"), limit(6))),
          ]);

        const counts = Object.fromEntries(
          pipelineStatuses.map((itemStatus, index) => [itemStatus, statusCounts[index]]),
        ) as Record<ApplicationStatus, number>;

        setPipeline(counts);
        setMetrics({
          totalApplications:
            totalMembership.data().count + totalLoans.data().count,
          newApplications: counts.new,
          inProgress: counts.in_review + counts.for_verification,
          approved: counts.approved + counts.released,
        });
        const membershipItems: Application[] = membershipRecent.docs.map(
          (document) => {
            const data = document.data();
            const status = isApplicationStatus(data.status) ? data.status : "new";
            return {
              id: document.id,
              reference:
                typeof data.reference === "string"
                  ? data.reference
                  : document.id,
              applicantName:
                typeof data.applicantName === "string"
                  ? data.applicantName
                  : "Name unavailable",
              applicationType:
                typeof data.applicationType === "string"
                  ? `Membership — ${data.applicationType}`
                  : "Membership",
              applicationGroup: "membership",
              submittedAt:
                data.submittedAt instanceof Timestamp ? data.submittedAt : null,
              status,
            };
          },
        );
        const loanItems: Application[] = loanRecent.docs.map((document) => {
          const data = document.data();
          const status = isApplicationStatus(data.status) ? data.status : "new";
          return {
            id: document.id,
            reference:
              typeof data.reference === "string" ? data.reference : document.id,
            applicantName:
              typeof data.applicantName === "string"
                ? data.applicantName
                : "Name unavailable",
            applicationType: isLoanType(data.typeOfLoan)
              ? `Loan — ${loanTypeLabels[data.typeOfLoan]}`
              : "Loan application",
            applicationGroup: "loan",
            submittedAt:
              data.submittedAt instanceof Timestamp ? data.submittedAt : null,
            status,
          };
        });
        setApplications(
          [...membershipItems, ...loanItems]
            .sort(
              (left, right) =>
                (right.submittedAt?.toMillis() ?? 0) -
                (left.submittedAt?.toMillis() ?? 0),
            )
            .slice(0, 6),
        );
      } catch (error) {
        console.error("Unable to load the manager dashboard.", error);
        setLoadError(
          "The dashboard could not load Firestore data. Please verify the database and security rules.",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadDashboard();
  }, []);

  const totalPipeline = Object.values(pipeline).reduce(
    (total, value) => total + value,
    0,
  );

  return (
    <div className={pageStyles.content}>
      <div id="overview" className={styles.overview}>
        <div className={pageStyles.welcome}>
          <div>
            <p className="eyebrow">Easy Apply workspace</p>
            <h1>Application and content overview</h1>
            <p>
              Review recent membership and loan applications, and manage the information
              published on the TIMGAS MPC website.
            </p>
          </div>
        </div>
        {loadError && (
          <div className={styles.error} role="alert">
            {loadError}
          </div>
        )}
        <section
          className={styles.metrics}
          aria-label="Application overview"
          aria-busy={loading}
        >
          <article>
            <div>
              <span>Total submissions</span>
              <strong>{loading ? "—" : metrics.totalApplications}</strong>
            </div>
            <FileText />
            <small>All Easy Apply records</small>
          </article>
          <article>
            <div>
              <span>New applications</span>
              <strong>{loading ? "—" : metrics.newApplications}</strong>
            </div>
            <Inbox />
            <small>Awaiting initial review</small>
          </article>
          <article>
            <div>
              <span>In progress</span>
              <strong>{loading ? "—" : metrics.inProgress}</strong>
            </div>
            <Clock3 />
            <small>In review or verification</small>
          </article>
          <article>
            <div>
              <span>Approved</span>
              <strong>{loading ? "—" : metrics.approved}</strong>
            </div>
            <CircleCheckBig />
            <small>Approved or released applications</small>
          </article>
        </section>
      </div>
      <section className={styles.tableSection} id="applications">
        <div className={styles.sectionHead}>
          <div>
            <p className={styles.sectionLabel}>Easy Apply</p>
            <h2>Recent applications</h2>
            <p>The six latest membership and loan applications submitted online.</p>
          </div>
          <Link to="/manager/applications">View all applications</Link>
        </div>
        {loading ? (
          <p className={styles.empty}>Loading applications…</p>
        ) : applications.length === 0 ? (
          <div className={styles.empty}>
            <FileText aria-hidden="true" />
            <strong>No applications yet</strong>
            <span>
              New membership and loan submissions will appear here.
            </span>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Applicant</th>
                  <th>Application type</th>
                  <th>Submitted</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <Link
                        to={`/manager/applications?type=${item.applicationGroup}`}
                        className={styles.referenceLink}
                      >
                        {item.reference}
                      </Link>
                    </td>
                    <td>{item.applicantName}</td>
                    <td>{item.applicationType}</td>
                    <td>{formatSubmittedAt(item.submittedAt)}</td>
                    <td>
                      <span
                        className={`${styles.status} ${styles[statusClassNames[item.status]]}`}
                      >
                        {statusLabels[item.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <section className={styles.bottomGrid} aria-label="Application pipeline">
        <article>
          <div className={styles.sectionHead}>
            <div>
              <p className={styles.sectionLabel}>Processing overview</p>
              <h2>Application pipeline</h2>
              <p>Distribution of submissions by current review status.</p>
            </div>
          </div>
          <div className={styles.pipeline}>
            {pipelineStatuses.map(
              (status) => {
                const value = pipeline[status];
                const width =
                  totalPipeline === 0
                    ? 0
                    : Math.round((value / totalPipeline) * 100);
                return (
                  <div key={status}>
                    <p>
                      <span>{statusLabels[status]}</span>
                      <strong>{loading ? "—" : value}</strong>
                    </p>
                    <i>
                      <b style={{ width: `${width}%` }} />
                    </i>
                  </div>
                );
              },
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
