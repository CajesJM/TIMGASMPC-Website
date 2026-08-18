import { AdminPostsManager } from '../../features/posts/AdminPostsManager';
import styles from './DashboardPage.module.css';

export function ManagerPostsPage() {
  return (
    <div className={styles.content}>
      <div className={styles.welcome}>
        <div><p className="eyebrow">Website content</p><h1>Public posts</h1><p>Create and manage announcements, cooperative news, achievements, and certification records displayed on the public website.</p></div>
      </div>
      <AdminPostsManager />
    </div>
  );
}
