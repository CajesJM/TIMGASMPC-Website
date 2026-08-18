import {
  collection,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  Timestamp,
  where,
} from 'firebase/firestore';
import { CircleCheckBig, Clock3, FileText, Inbox } from 'lucide-react';
import { useEffect, useState } from 'react';
import { db } from '../../lib/firestore';
import styles from './DashboardPage.module.css';

type ApplicationStatus = 'new' | 'in_review' | 'for_verification' | 'approved';

type Application = {
  id: string;
  reference: string;
  applicantName: string;
  applicationType: string;
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
  new: 'New',
  in_review: 'In review',
  for_verification: 'For verification',
  approved: 'Approved',
};

const statusClassNames: Record<ApplicationStatus, string> = {
  new: 'new',
  in_review: 'inreview',
  for_verification: 'forverification',
  approved: 'approved',
};

function formatSubmittedAt(value: Timestamp | null) {
  if (!value) return 'Date unavailable';
  return new Intl.DateTimeFormat('en-PH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value.toDate());
}

export function DashboardPage() {
  const [metrics, setMetrics] = useState(emptyMetrics);
  const [pipeline, setPipeline] = useState<Record<ApplicationStatus, number>>({
    new: 0,
    in_review: 0,
    for_verification: 0,
    approved: 0,
  });
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(Boolean(db));
  const [loadError, setLoadError] = useState(
    db ? '' : 'Firebase is not configured for this environment.',
  );
  useEffect(() => {
    if (!db) return;

    const firestore = db;
    const loadDashboard = async () => {
      try {
        const applicationsRef = collection(firestore, 'applications');
        const statusQueries = {
          new: query(applicationsRef, where('status', '==', 'new')),
          in_review: query(applicationsRef, where('status', '==', 'in_review')),
          for_verification: query(applicationsRef, where('status', '==', 'for_verification')),
          approved: query(applicationsRef, where('status', '==', 'approved')),
        };

        const [newCount, reviewCount, verificationCount, approvedCount, recentSnapshot] = await Promise.all([
          getCountFromServer(statusQueries.new),
          getCountFromServer(statusQueries.in_review),
          getCountFromServer(statusQueries.for_verification),
          getCountFromServer(statusQueries.approved),
          getDocs(query(applicationsRef, orderBy('submittedAt', 'desc'), limit(6))),
        ]);

        const counts = {
          new: newCount.data().count,
          in_review: reviewCount.data().count,
          for_verification: verificationCount.data().count,
          approved: approvedCount.data().count,
        };

        setPipeline(counts);
        setMetrics({
          totalApplications: Object.values(counts).reduce((total, count) => total + count, 0),
          newApplications: counts.new,
          inProgress: counts.in_review + counts.for_verification,
          approved: counts.approved,
        });
        setApplications(recentSnapshot.docs.map((document) => {
          const data = document.data();
          const status = data.status in statusLabels ? data.status as ApplicationStatus : 'new';
          return {
            id: document.id,
            reference: typeof data.reference === 'string' ? data.reference : document.id,
            applicantName: typeof data.applicantName === 'string' ? data.applicantName : 'Name unavailable',
            applicationType: typeof data.applicationType === 'string' ? data.applicationType : 'Membership',
            submittedAt: data.submittedAt instanceof Timestamp ? data.submittedAt : null,
            status,
          };
        }));
      } catch (error) {
        console.error('Unable to load the manager dashboard.', error);
        setLoadError('The dashboard could not load Firestore data. Please verify the database and security rules.');
      } finally {
        setLoading(false);
      }
    };

    void loadDashboard();
  }, []);

  const totalPipeline = Object.values(pipeline).reduce((total, value) => total + value, 0);

  return <div className={styles.content}>
        <div id="overview" className={styles.overview}>
          <div className={styles.welcome}><div><p className="eyebrow">Easy Apply workspace</p><h1>Application and content overview</h1><p>Review recent membership inquiries and manage the information published on the TIMGAS MPC website.</p></div></div>
          {loadError && <div className={styles.error} role="alert">{loadError}</div>}
          <section className={styles.metrics} aria-label="Application overview" aria-busy={loading}>
            <article><div><span>Total submissions</span><strong>{loading ? '—' : metrics.totalApplications}</strong></div><FileText /><small>All Easy Apply records</small></article>
            <article><div><span>New applications</span><strong>{loading ? '—' : metrics.newApplications}</strong></div><Inbox /><small>Awaiting initial review</small></article>
            <article><div><span>In progress</span><strong>{loading ? '—' : metrics.inProgress}</strong></div><Clock3 /><small>In review or verification</small></article>
            <article><div><span>Approved</span><strong>{loading ? '—' : metrics.approved}</strong></div><CircleCheckBig /><small>Completed application review</small></article>
          </section>
        </div>
        <section className={styles.tableSection} id="applications">
          <div className={styles.sectionHead}><div><p className={styles.sectionLabel}>Easy Apply</p><h2>Recent applications</h2><p>The six latest membership inquiries submitted online.</p></div></div>
          {loading ? <p className={styles.empty}>Loading applications…</p> : applications.length === 0 ? <div className={styles.empty}><FileText aria-hidden="true" /><strong>No applications yet</strong><span>New submissions will appear here when the official application workflow is connected.</span></div> : <div className={styles.tableWrap}><table><thead><tr><th>Reference</th><th>Applicant</th><th>Application type</th><th>Submitted</th><th>Status</th></tr></thead><tbody>{applications.map((item) => <tr key={item.id}><td><strong>{item.reference}</strong></td><td>{item.applicantName}</td><td>{item.applicationType}</td><td>{formatSubmittedAt(item.submittedAt)}</td><td><span className={`${styles.status} ${styles[statusClassNames[item.status]]}`}>{statusLabels[item.status]}</span></td></tr>)}</tbody></table></div>}
        </section>
        <section className={styles.bottomGrid} aria-label="Application pipeline"><article><div className={styles.sectionHead}><div><p className={styles.sectionLabel}>Processing overview</p><h2>Application pipeline</h2><p>Distribution of submissions by current review status.</p></div></div><div className={styles.pipeline}>{(Object.keys(statusLabels) as ApplicationStatus[]).map((status) => {
          const value = pipeline[status];
          const width = totalPipeline === 0 ? 0 : Math.round((value / totalPipeline) * 100);
          return <div key={status}><p><span>{statusLabels[status]}</span><strong>{loading ? '—' : value}</strong></p><i><b style={{ width: `${width}%` }} /></i></div>;
        })}</div></article></section>
  </div>;
}
