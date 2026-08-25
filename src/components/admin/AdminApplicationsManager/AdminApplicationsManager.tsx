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
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Search,
  Trash2,
  X,
} from "lucide-react";
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

export function AdminApplicationsManager({
  showToast,
}: {
  showToast: ShowToast;
}) {
  const [items, setItems] = useState<MembershipApplication[]>([]);
  const [selected, setSelected] = useState<MembershipApplication | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | ApplicationStatus>("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(Boolean(db));
  const [statusNote, setStatusNote] = useState("");
  const [deleteTarget, setDeleteTarget] =
    useState<MembershipApplication | null>(null);
  const [deleting, setDeleting] = useState(false);

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
          item.applicantName.toLowerCase().includes(term) ||
          item.applicantEmail.toLowerCase().includes(term) ||
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

  const removeApplication = async () => {
    if (!db || !deleteTarget) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, "applications", deleteTarget.id));
      if (selected?.id === deleteTarget.id) setSelected(null);
      setDeleteTarget(null);
      showToast("Application deleted.", "warning");
    } catch (error) {
      console.error("Unable to delete application.", error);
      showToast("Application could not be deleted.", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section className={styles.manager}>
      <div className={styles.toolbar}>
        <label>
          <Search />
          <span className="srOnly">Search applications</span>
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search name or reference"
          />
        </label>
        <select
          value={filter}
          onChange={(event) => {
            setFilter(event.target.value as "all" | ApplicationStatus);
            setPage(1);
          }}
          aria-label="Filter applications by status"
        >
          <option value="all">All statuses</option>
          {applicationStatuses.map((status) => (
            <option key={status} value={status}>
              {applicationStatusLabels[status]}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className={styles.empty}>Loading applications…</p>
      ) : visible.length === 0 ? (
        <div className={styles.empty}>
          <FileText />
          <strong>No matching applications</strong>
          <span>Online submissions will appear here.</span>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                <th className={styles.numberColumn}>No.</th>
                <th>Reference</th>
                <th>Applicant</th>
                <th>Type</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>
                  <span className="srOnly">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map((item, index) => (
                <tr key={item.id}>
                  <td className={styles.numberCell}>
                    {(currentPage - 1) * pageSize + index + 1}
                  </td>
                  <td>
                    <button
                      className={styles.reference}
                      onClick={() => openApplication(item)}
                    >
                      {item.reference}
                    </button>
                  </td>
                  <td>
                    {item.applicantName}
                    <small>
                      {item.applicantEmail || item.profile.cellphone}
                    </small>
                  </td>
                  <td>{membershipTypeLabels[item.applicationType]}</td>
                  <td>{formatApplicationDate(item.submittedAt)}</td>
                  <td>
                    <span className={`${styles.status} ${styles[item.status]}`}>
                      {applicationStatusLabels[item.status]}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        className={styles.viewButton}
                        onClick={() => openApplication(item)}
                        aria-label={`View ${item.reference}`}
                        title="View application"
                      >
                        <Eye />
                      </button>
                      <button
                        className={styles.deleteButton}
                        onClick={() => setDeleteTarget(item)}
                        aria-label={`Delete ${item.reference}`}
                        title="Delete application"
                      >
                        <Trash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filtered.length > pageSize && (
        <nav className={styles.pagination} aria-label="Application pages">
          <button
            disabled={currentPage === 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
          >
            <ChevronLeft /> Previous
          </button>
          <span className={styles.paginationInfo}>
            Showing {(currentPage - 1) * pageSize + 1}–
            {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}
            <small>Page {currentPage} of {pages}</small>
          </span>
          <button
            disabled={currentPage === pages}
            onClick={() => setPage((value) => Math.min(pages, value + 1))}
          >
            Next <ChevronRight />
          </button>
        </nav>
      )}

      {selected && (
        <div
          className={styles.modalBackdrop}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelected(null);
          }}
        >
          <article
            className={styles.detail}
            role="dialog"
            aria-modal="true"
            aria-labelledby="application-title"
          >
            <header className={styles.modalBar}>
              <div>
                <span>Official digital record</span>
                <strong id="application-title">{selected.reference}</strong>
              </div>
              <button
                onClick={() => setSelected(null)}
                aria-label="Close application"
              >
                <X />
              </button>
            </header>
            <section className={styles.reviewBar} aria-label="Application review">
              <label>
                Status
                <select
                  value={selected.status}
                  onChange={(event) =>
                    setSelected({
                      ...selected,
                      status: event.target.value as ApplicationStatus,
                    })
                  }
                >
                  {applicationStatuses.map((status) => (
                    <option key={status} value={status}>
                      {applicationStatusLabels[status]}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Manager note
                <textarea
                  rows={2}
                  maxLength={1000}
                  value={statusNote}
                  onChange={(event) => setStatusNote(event.target.value)}
                  placeholder="Optional internal note"
                />
              </label>
              <button onClick={() => void updateStatus(selected.status)}>
                Save review
              </button>
            </section>
            <div className={styles.documentWrap}>
              <OfficialMembershipReview
                data={{
                  reference: selected.reference,
                  dateApplied: formatApplicationDate(selected.submittedAt),
                  applicantEmail: selected.applicantEmail,
                  membershipType: selected.applicationType,
                  profile: selected.profile,
                  spouse: selected.spouse,
                  dependents: selected.dependents,
                  income: selected.income,
                  sector: selected.sector,
                  educationalAttainment: selected.educationalAttainment,
                  affiliation: selected.affiliation,
                  crimeDisclosure: selected.crimeDisclosure,
                  recommenderName: selected.recommenderName,
                  typedName: selected.agreement.typedName,
                }}
              />
            </div>
          </article>
        </div>
      )}
      {deleteTarget && (
        <div
          className={styles.confirmBackdrop}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !deleting)
              setDeleteTarget(null);
          }}
        >
          <section
            className={styles.confirmDialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-application-title"
            aria-describedby="delete-application-description"
          >
            <span className={styles.confirmIcon} aria-hidden="true">
              <AlertTriangle />
            </span>
            <div>
              <p>Permanent action</p>
              <h2 id="delete-application-title">Delete this application?</h2>
              <p id="delete-application-description">
                You are about to permanently delete{" "}
                <strong>{deleteTarget.reference}</strong> for{" "}
                {deleteTarget.applicantName}. This record cannot be restored.
              </p>
            </div>
            <footer>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void removeApplication()}
                disabled={deleting}
              >
                {deleting ? "Deleting…" : "Delete application"}
              </button>
            </footer>
          </section>
        </div>
      )}
    </section>
  );
}
