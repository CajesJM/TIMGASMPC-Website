import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { ChevronLeft, ChevronRight, FileText, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  applicationStatusLabels,
  applicationStatuses,
  formatApplicationDate,
  membershipTypeLabels,
  parseMembershipApplication,
  type ApplicationStatus,
  type MembershipApplication,
} from "../../../features/applications/applicationTypes";
import type { ShowToast } from "../../../features/notifications/toastTypes";
import { db } from "../../../lib/firestore";
import { OfficialMembershipReview } from "../../application/OfficialMembershipReview/OfficialMembershipReview";
import styles from "./AdminApplicationsManager.module.css";

const pageSize = 10;

export function AdminApplicationsManager({ showToast }: { showToast: ShowToast }) {
  const [items, setItems] = useState<MembershipApplication[]>([]);
  const [selected, setSelected] = useState<MembershipApplication | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | ApplicationStatus>("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(Boolean(db));
  const [statusNote, setStatusNote] = useState("");

  useEffect(() => {
    if (!db) return;
    return onSnapshot(
      query(collection(db, "applications"), orderBy("submittedAt", "desc")),
      (snapshot) => {
        setItems(snapshot.docs.map(parseMembershipApplication));
        setLoading(false);
      },
      (error) => {
        console.error("Unable to load applications.", error);
        showToast("Applications could not be loaded.", "error");
        setLoading(false);
      },
    );
  }, [showToast]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return items.filter(
      (item) =>
        (filter === "all" || item.status === filter) &&
        (!term ||
          item.applicantName.toLowerCase().includes(term) || item.applicantEmail.toLowerCase().includes(term) ||
          item.reference.toLowerCase().includes(term)),
    );
  }, [filter, items, search]);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const openApplication = (item: MembershipApplication) => {
    setSelected(item);
    setStatusNote(item.statusNote);
  };

  const updateStatus = async (status: ApplicationStatus) => {
    if (!db || !selected) return;
    try {
      await updateDoc(doc(db, "applications", selected.id), {
        status,
        statusNote: statusNote.trim(),
        updatedAt: serverTimestamp(),
      });
      setSelected({ ...selected, status, statusNote: statusNote.trim() });
      showToast("Application status updated.");
    } catch (error) {
      console.error("Unable to update application.", error);
      showToast("Application could not be updated.", "error");
    }
  };

  const removeApplication = async (item: MembershipApplication) => {
    if (!db || !window.confirm(`Delete ${item.reference}? This cannot be undone.`)) return;
    try {
      await deleteDoc(doc(db, "applications", item.id));
      if (selected?.id === item.id) setSelected(null);
      showToast("Application deleted.", "warning");
    } catch (error) {
      console.error("Unable to delete application.", error);
      showToast("Application could not be deleted.", "error");
    }
  };

  return (
    <section className={styles.manager}>
      <div className={styles.toolbar}>
        <label><Search /><span className="srOnly">Search applications</span><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search name or reference" /></label>
        <select value={filter} onChange={(event) => { setFilter(event.target.value as "all" | ApplicationStatus); setPage(1); }} aria-label="Filter applications by status">
          <option value="all">All statuses</option>
          {applicationStatuses.map((status) => <option key={status} value={status}>{applicationStatusLabels[status]}</option>)}
        </select>
      </div>

      {loading ? <p className={styles.empty}>Loading applications…</p> : visible.length === 0 ? (
        <div className={styles.empty}><FileText /><strong>No matching applications</strong><span>Online submissions will appear here.</span></div>
      ) : (
        <div className={styles.tableWrap}><table><thead><tr><th>Reference</th><th>Applicant</th><th>Type</th><th>Submitted</th><th>Status</th><th><span className="srOnly">Actions</span></th></tr></thead><tbody>
          {visible.map((item) => <tr key={item.id}><td><button className={styles.reference} onClick={() => openApplication(item)}>{item.reference}</button></td><td>{item.applicantName}<small>{item.applicantEmail || item.profile.cellphone}</small></td><td>{membershipTypeLabels[item.applicationType]}</td><td>{formatApplicationDate(item.submittedAt)}</td><td><span className={`${styles.status} ${styles[item.status]}`}>{applicationStatusLabels[item.status]}</span></td><td><button className={styles.deleteButton} onClick={() => void removeApplication(item)} aria-label={`Delete ${item.reference}`}><Trash2 /></button></td></tr>)}
        </tbody></table></div>
      )}

      {filtered.length > pageSize && <nav className={styles.pagination} aria-label="Application pages"><button disabled={currentPage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}><ChevronLeft /> Previous</button><span>Page {currentPage} of {pages}</span><button disabled={currentPage === pages} onClick={() => setPage((value) => Math.min(pages, value + 1))}>Next <ChevronRight /></button></nav>}

      {selected && <div className={styles.modalBackdrop} onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}><article className={styles.detail} role="dialog" aria-modal="true" aria-labelledby="application-title"><header><div><small>{selected.reference}</small><h2 id="application-title">{selected.applicantName}</h2><p>{membershipTypeLabels[selected.applicationType]} membership · {formatApplicationDate(selected.submittedAt)}</p></div><button onClick={() => setSelected(null)} aria-label="Close application">×</button></header>
        <div className={styles.documentWrap}><OfficialMembershipReview data={{ reference: selected.reference, dateApplied: formatApplicationDate(selected.submittedAt), applicantEmail: selected.applicantEmail, membershipType: selected.applicationType, profile: selected.profile, spouse: selected.spouse, dependents: selected.dependents, income: selected.income, sector: selected.sector, educationalAttainment: selected.educationalAttainment, affiliation: selected.affiliation, crimeDisclosure: selected.crimeDisclosure, recommenderName: selected.recommenderName, typedName: selected.agreement.typedName }} /></div>
        <footer><label>Status<select value={selected.status} onChange={(event) => setSelected({ ...selected, status: event.target.value as ApplicationStatus })}>{applicationStatuses.map((status) => <option key={status} value={status}>{applicationStatusLabels[status]}</option>)}</select></label><label>Manager note<textarea rows={3} maxLength={1000} value={statusNote} onChange={(event) => setStatusNote(event.target.value)} /></label><button onClick={() => void updateStatus(selected.status)}>Save review update</button></footer>
      </article></div>}
    </section>
  );
}
