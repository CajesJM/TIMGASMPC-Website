import { useOutletContext } from "react-router-dom";
import { AdminApplicationsManager } from "../../../components/admin/AdminApplicationsManager/AdminApplicationsManager";
import type { ManagerOutletContext } from "../../../layouts/admin/ManagerLayout/ManagerLayout";
import pageStyles from "../../../styles/admin/AdminPage.module.css";

export function ManagerApplicationsPage() {
  const { showToast } = useOutletContext<ManagerOutletContext>();
  return <div className={pageStyles.content}><div className={pageStyles.welcome}><div><p className="eyebrow">Easy Apply</p><h1>Membership applications</h1><p>Review private submissions, record verification progress, and manage application records.</p></div></div><AdminApplicationsManager showToast={showToast} /></div>;
}
