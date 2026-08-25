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
import { ArrowDown, CircleCheckBig, Clock3, FileText, Inbox } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
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

const chartColors: Record<ApplicationStatus, string> = {
  new: "#1976a8",
  in_review: "#c78c16",
  for_verification: "#7a54a4",
  approved: "#287a4d",
  disapproved: "#bc4848",
  released: "#197d86",
};

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

function useAnimatedNumber(value: number, loading: boolean) {
  const [displayValue, setDisplayValue] = useState(0);
  const previousValue = useRef(0);

  useEffect(() => {
    if (loading) return;

    const startValue = previousValue.current;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reducedMotion ? 0 : 700;
    const startedAt = performance.now();
    let frameId = 0;

    const animate = (now: number) => {
      const progress = duration === 0 ? 1 : Math.min((now - startedAt) / duration, 1);
      const easedProgress = 1 - (1 - progress) ** 3;
      setDisplayValue(Math.round(startValue + (value - startValue) * easedProgress));
      if (progress < 1) {
        frameId = window.requestAnimationFrame(animate);
      } else {
        previousValue.current = value;
      }
    };

    frameId = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frameId);
  }, [loading, value]);

  return displayValue;
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
            getDocs(query(membershipRef, orderBy("submittedAt", "desc"), limit(5))),
            getDocs(query(loanRef, orderBy("submittedAt", "desc"), limit(5))),
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
            .slice(0, 5),
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
  const animatedTotalApplications = useAnimatedNumber(metrics.totalApplications, loading);
  const animatedNewApplications = useAnimatedNumber(metrics.newApplications, loading);
  const animatedInProgress = useAnimatedNumber(metrics.inProgress, loading);
  const animatedApproved = useAnimatedNumber(metrics.approved, loading);
  const animatedTotalPipeline = useAnimatedNumber(totalPipeline, loading);
  let chartPosition = 0;
  const chartStops = pipelineStatuses.map((status) => {
    const segment = totalPipeline === 0 ? 0 : (pipeline[status] / totalPipeline) * 100;
    const start = chartPosition;
    chartPosition += segment;
    return `${chartColors[status]} ${start}% ${chartPosition}%`;
  });
  const chartStyle = {
    background: totalPipeline > 0
      ? `conic-gradient(${chartStops.join(", ")})`
      : "conic-gradient(#e8efea 0deg 360deg)",
  } as CSSProperties;

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
              <strong>{loading ? "—" : animatedTotalApplications}</strong>
            </div>
            <FileText />
            <small>All Easy Apply records</small>
          </article>
          <article>
            <div>
              <span>New applications</span>
              <strong>{loading ? "—" : animatedNewApplications}</strong>
            </div>
            <Inbox />
            <small>Awaiting initial review</small>
          </article>
          <article>
            <div>
              <span>In progress</span>
              <strong>{loading ? "—" : animatedInProgress}</strong>
            </div>
            <Clock3 />
            <small>In review or verification</small>
          </article>
          <article>
            <div>
              <span>Approved</span>
              <strong>{loading ? "—" : animatedApproved}</strong>
            </div>
            <CircleCheckBig />
            <small>Approved or released applications</small>
          </article>
        </section>
      </div>
      <section className={styles.chartSection} aria-label="Processing overview">
        <div className={styles.sectionHead}>
          <div>
            <p className={styles.sectionLabel}>Processing overview</p>
            <h2>Application status distribution</h2>
            <p>A live view of where Easy Apply records are in the review process.</p>
          </div>
        </div>
        <div className={styles.chartContent}>
          <div
            className={styles.donut}
            style={chartStyle}
            role="img"
            aria-label={loading ? "Loading application status distribution" : `${totalPipeline} applications across six review statuses`}
          >
            <div>
              <strong>{loading ? "—" : animatedTotalPipeline}</strong>
              <span>applications</span>
            </div>
          </div>
          <div className={styles.chartLegend}>
            {pipelineStatuses.map((status) => {
              const percentage = totalPipeline === 0 ? 0 : (pipeline[status] / totalPipeline) * 100;
              return (
              <div key={status}>
                <div className={styles.legendMeta}>
                  <span style={{ backgroundColor: chartColors[status] }} aria-hidden="true" />
                  <p>{statusLabels[status]}</p>
                  <strong>{loading ? "—" : pipeline[status]}</strong>
                </div>
                <i className={styles.legendBar} aria-hidden="true">
                  <b
                    style={{
                      "--bar-progress": `${percentage}%`,
                      "--bar-color": chartColors[status],
                    } as CSSProperties}
                  />
                </i>
              </div>
              );
            })}
          </div>
        </div>
      </section>
      <section className={styles.tableSection} id="applications">
        <div className={styles.sectionHead}>
          <div>
            <p className={styles.sectionLabel}>Easy Apply</p>
            <h2>Recent applications</h2>
            <p>The five latest membership and loan applications submitted online.</p>
          </div>
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
          <>
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
                {applications.map((item, index) => (
                  <tr
                    key={item.id}
                    className={`${styles.recentRow} ${index === applications.length - 1 ? styles.fadedRow : ""}`}
                    style={{ "--row-delay": `${index * 70}ms` } as CSSProperties}
                  >
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
          <Link className={styles.showMore} to="/manager/applications">
            Show more applications
            <ArrowDown size={15} aria-hidden="true" />
          </Link>
          </>
        )}
      </section>
    </div>
  );
}
