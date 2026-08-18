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
import { FileText, Home, LayoutDashboard, LogOut, Megaphone, Menu, Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { BrandMark } from '../../components/BrandMark/BrandMark';
import { AdminPostsManager } from '../../features/posts/AdminPostsManager';
import { auth } from '../../lib/firebase';
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
  newApplications: number;
  inReview: number;
  totalMembers: number;
  publishedUpdates: number;
};

const emptyMetrics: DashboardMetrics = {
  newApplications: 0,
  inReview: 0,
  totalMembers: 0,
  publishedUpdates: 0,
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
  const [open, setOpen] = useState(false);
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
  const navigate = useNavigate();
  const managerEmail = auth?.currentUser?.email ?? 'Manager';
  const managerInitials = managerEmail.slice(0, 2).toUpperCase();

  useEffect(() => {
    if (!db) return;

    const firestore = db;
    const loadDashboard = async () => {
      try {
        const applicationsRef = collection(firestore, 'applications');
        const membersRef = collection(firestore, 'members');
        const postsRef = collection(firestore, 'posts');
        const statusQueries = {
          new: query(applicationsRef, where('status', '==', 'new')),
          in_review: query(applicationsRef, where('status', '==', 'in_review')),
          for_verification: query(applicationsRef, where('status', '==', 'for_verification')),
          approved: query(applicationsRef, where('status', '==', 'approved')),
        };

        const [newCount, reviewCount, verificationCount, approvedCount, memberCount, publishedCount, recentSnapshot] = await Promise.all([
          getCountFromServer(statusQueries.new),
          getCountFromServer(statusQueries.in_review),
          getCountFromServer(statusQueries.for_verification),
          getCountFromServer(statusQueries.approved),
          getCountFromServer(membersRef),
          getCountFromServer(query(postsRef, where('status', '==', 'published'))),
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
          newApplications: counts.new,
          inReview: counts.in_review,
          totalMembers: memberCount.data().count,
          publishedUpdates: publishedCount.data().count,
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

  const signOutManager = async () => {
    if (auth) await signOut(auth);
    navigate('/manager-login', { replace: true });
  };

  const totalPipeline = Object.values(pipeline).reduce((total, value) => total + value, 0);

  return <div className={styles.shell}>
    <aside className={`${styles.sidebar} ${open ? styles.open : ''}`}>
      <div className={styles.sidebarHead}><BrandMark inverse compact /><button onClick={() => setOpen(false)} aria-label="Close menu"><X /></button></div>
      <nav aria-label="Manager navigation"><a className={styles.active} href="#dashboard"><LayoutDashboard /> Overview</a><a href="#applications"><FileText /> Applications {metrics.newApplications > 0 && <span>{metrics.newApplications}</span>}</a><a href="#posts"><Megaphone /> Public posts</a></nav>
      <div className={styles.sidebarFoot}><Link to="/"><Home /> View public website</Link><button type="button" onClick={signOutManager}><LogOut /> Sign out</button></div>
    </aside>
    <main className={styles.main} id="dashboard">
      <header className={styles.topbar}><button className={styles.mobileMenu} onClick={() => setOpen(true)} aria-label="Open menu"><Menu /></button><div className={styles.profile}><span>{managerInitials}</span><div><strong>{managerEmail}</strong><small>Administrator</small></div></div></header>
      <div className={styles.content}>
        <div className={styles.welcome}><div><p className="eyebrow">Secure manager area</p><h1>Manager overview</h1><p>Verified information from the TIMGAS MPC Firestore database.</p></div></div>
        {loadError && <div className={styles.error} role="alert">{loadError}</div>}
        <section className={styles.metrics} aria-label="Application overview" aria-busy={loading}>
          <article><div><span>New applications</span><strong>{loading ? '—' : metrics.newApplications}</strong></div><FileText /><small>Awaiting initial review</small></article>
          <article><div><span>In review</span><strong>{loading ? '—' : metrics.inReview}</strong></div><LayoutDashboard /><small>Currently being processed</small></article>
          <article><div><span>Member records</span><strong>{loading ? '—' : metrics.totalMembers}</strong></div><Users /><small>Records stored in Firestore</small></article>
          <article><div><span>Published updates</span><strong>{loading ? '—' : metrics.publishedUpdates}</strong></div><Megaphone /><small>Public announcements</small></article>
        </section>
        <section className={styles.tableSection} id="applications">
          <div className={styles.sectionHead}><div><h2>Recent applications</h2><p>Latest application records stored in Firestore.</p></div></div>
          {loading ? <p className={styles.empty}>Loading applications…</p> : applications.length === 0 ? <div className={styles.empty}><FileText aria-hidden="true" /><strong>No applications yet</strong><span>New submissions will appear here when the official application workflow is connected.</span></div> : <div className={styles.tableWrap}><table><thead><tr><th>Reference</th><th>Applicant</th><th>Application type</th><th>Submitted</th><th>Status</th></tr></thead><tbody>{applications.map((item) => <tr key={item.id}><td><strong>{item.reference}</strong></td><td>{item.applicantName}</td><td>{item.applicationType}</td><td>{formatSubmittedAt(item.submittedAt)}</td><td><span className={`${styles.status} ${styles[statusClassNames[item.status]]}`}>{statusLabels[item.status]}</span></td></tr>)}</tbody></table></div>}
        </section>
        <section className={styles.bottomGrid} aria-label="Application pipeline"><article><div className={styles.sectionHead}><div><h2>Application pipeline</h2><p>Current processing status</p></div></div><div className={styles.pipeline}>{(Object.keys(statusLabels) as ApplicationStatus[]).map((status) => {
          const value = pipeline[status];
          const width = totalPipeline === 0 ? 0 : Math.round((value / totalPipeline) * 100);
          return <div key={status}><p><span>{statusLabels[status]}</span><strong>{loading ? '—' : value}</strong></p><i><b style={{ width: `${width}%` }} /></i></div>;
        })}</div></article></section>
        <AdminPostsManager />
      </div>
    </main>
  </div>;
}
