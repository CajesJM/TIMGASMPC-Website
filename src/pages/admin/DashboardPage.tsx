import { Bell, ChevronDown, CircleUserRound, FileText, Home, LayoutDashboard, LogOut, Megaphone, Menu, Search, Settings, Users, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BrandMark } from '../../components/BrandMark/BrandMark';
import styles from './DashboardPage.module.css';

const applications = [
  { ref: 'TMC-260816-041', name: 'Ana Dela Cruz', type: 'Membership', submitted: 'Today, 9:42 AM', status: 'New' },
  { ref: 'TMC-260815-040', name: 'Ramon Villanueva', type: 'Farm assistance', submitted: 'Aug 15, 2026', status: 'In review' },
  { ref: 'TMC-260814-039', name: 'Liza Manalo', type: 'Membership', submitted: 'Aug 14, 2026', status: 'For verification' },
  { ref: 'TMC-260812-038', name: 'Nestor Ramos', type: 'Loan inquiry', submitted: 'Aug 12, 2026', status: 'Approved' },
];

export function DashboardPage() {
  const [open, setOpen] = useState(false);
  return <div className={styles.shell}>
    <aside className={`${styles.sidebar} ${open ? styles.open : ''}`}>
      <div className={styles.sidebarHead}><BrandMark inverse compact /><button onClick={() => setOpen(false)} aria-label="Close menu"><X /></button></div>
      <nav><a className={styles.active} href="#dashboard"><LayoutDashboard /> Overview</a><a href="#applications"><FileText /> Applications <span>8</span></a><a href="#members"><Users /> Officers</a><a href="#content"><Megaphone /> Website content</a><a href="#settings"><Settings /> Settings</a></nav>
      <div className={styles.sidebarFoot}><Link to="/"><Home /> View public website</Link><Link to="/manager-login"><LogOut /> Sign out</Link></div>
    </aside>
    <main className={styles.main}>
      <header className={styles.topbar}><button className={styles.mobileMenu} onClick={() => setOpen(true)} aria-label="Open menu"><Menu /></button><div className={styles.search}><Search size={18} /><input aria-label="Search dashboard" placeholder="Search applications" /></div><div className={styles.profile}><button aria-label="Notifications"><Bell /></button><span>JM</span><div><strong>Juan Manager</strong><small>Administrator</small></div><ChevronDown size={16} /></div></header>
      <div className={styles.content}><div className={styles.welcome}><div><p className="eyebrow">Sunday, August 16</p><h1>Good evening, Juan.</h1><p>Here’s what is happening across your cooperative website.</p></div><button>+ New announcement</button></div>
        <div className={styles.demo}><span>Preview mode</span> Firebase Authentication and live cooperative data will be connected during backend setup.</div>
        <section className={styles.metrics} aria-label="Application overview"><article><div><span>New applications</span><strong>8</strong></div><FileText /><small>3 received this week</small></article><article><div><span>In review</span><strong>12</strong></div><Search /><small>4 need your attention</small></article><article><div><span>Total members</span><strong>1,247</strong></div><Users /><small>+18 this quarter</small></article><article><div><span>Published updates</span><strong>24</strong></div><Megaphone /><small>3 scheduled</small></article></section>
        <section className={styles.tableSection}><div className={styles.sectionHead}><div><h2>Recent applications</h2><p>Review and manage the latest submissions.</p></div><button>View all applications</button></div><div className={styles.tableWrap}><table><thead><tr><th>Reference</th><th>Applicant</th><th>Application type</th><th>Submitted</th><th>Status</th><th><span className="srOnly">Actions</span></th></tr></thead><tbody>{applications.map(item => <tr key={item.ref}><td><strong>{item.ref}</strong></td><td>{item.name}</td><td>{item.type}</td><td>{item.submitted}</td><td><span className={`${styles.status} ${styles[item.status.toLowerCase().replace(' ', '')]}`}>{item.status}</span></td><td><button aria-label={`Open ${item.ref}`}>•••</button></td></tr>)}</tbody></table></div></section>
        <section className={styles.bottomGrid}><article><div className={styles.sectionHead}><div><h2>Application pipeline</h2><p>Current processing status</p></div></div><div className={styles.pipeline}>{[['New', 8, 40], ['In review', 12, 60], ['For verification', 5, 25], ['Approved', 18, 90]].map(([label, value, width]) => <div key={label}><p><span>{label}</span><strong>{value}</strong></p><i><b style={{ width: `${width}%` }} /></i></div>)}</div></article><article><div className={styles.sectionHead}><div><h2>Quick actions</h2><p>Common management tasks</p></div></div><div className={styles.actions}><button><FileText /> Review new applications</button><button><Megaphone /> Publish an announcement</button><button><CircleUserRound /> Update officer profiles</button></div></article></section>
      </div>
    </main>
  </div>;
}
