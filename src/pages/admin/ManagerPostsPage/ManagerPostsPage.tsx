import { useOutletContext } from "react-router-dom";
import { AdminPostsManager } from "@/components/admin/posts/AdminPostsManager/AdminPostsManager";
import type { ManagerOutletContext } from "@/components/admin/layout/ManagerLayout/ManagerLayout";
import styles from "@/styles/admin/pages/AdminPage.module.css";

export function ManagerPostsPage() {
  const { showToast } = useOutletContext<ManagerOutletContext>();

  return (
    <div className={styles.content}>
      <div className={styles.welcome}>
        <div>
          <p className="eyebrow">Website content</p>
          <h1>Public posts</h1>
          <p>
            Create and manage announcements, cooperative news, achievements, and
            certification records displayed on the public website.
          </p>
        </div>
      </div>
      <AdminPostsManager showToast={showToast} />
    </div>
  );
}
