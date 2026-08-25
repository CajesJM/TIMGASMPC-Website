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
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileSpreadsheet,
  LoaderCircle,
  Plus,
  Printer,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import timgasLogo from "@/assets/images/brand/timgas-logo.png";
import { ensureBoholAddress } from "@/features/applications/boholLocations";
import {
  downloadApplicationDocument,
  printApplicationDocument,
} from "@/features/applications/applicationDocumentExport";
import {
  formatPeso,
  loanPaymentModeLabels,
  loanStatusLabels,
  loanStatuses,
  loanTypeLabels,
  loanTypeOptions,
  parseLoanApplication,
  type LoanApplication,
  type LoanReview,
  type LoanStatus,
} from "@/features/applications/loanApplicationTypes";
import type { ShowToast } from "@/features/notifications/toastTypes";
import { db } from "@/services/firebase/firestore";
import styles from "@/styles/admin/components/applications/AdminLoanApplicationsManager.module.css";

const pageSize = 10;

function dateFiled(item: LoanApplication) {
  if (!item.submittedAt) return "Date unavailable";
  return new Intl.DateTimeFormat("en-PH", { dateStyle: "medium" }).format(
    item.submittedAt.toDate(),
  );
}

function numberFromInput(value: string) {
  return value.trim() ? Number(value) : null;
}

export function AdminLoanApplicationsManager({
  showToast,
}: {
  showToast: ShowToast;
}) {
  const [items, setItems] = useState<LoanApplication[]>([]);
  const [selected, setSelected] = useState<LoanApplication | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | LoanStatus>("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(Boolean(db));
  const [status, setStatus] = useState<LoanStatus>("new");
  const [statusNote, setStatusNote] = useState("");
  const [review, setReview] = useState<LoanReview | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<LoanApplication | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState<"docx" | "pdf" | "print" | null>(null);
  const documentRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!db) return;
    return onSnapshot(
      query(collection(db, "loanApplications"), orderBy("submittedAt", "desc")),
      (snapshot) => {
        setItems(snapshot.docs.map(parseLoanApplication));
        setLoading(false);
      },
      (error) => {
        console.error("Unable to load loan applications.", error);
        showToast("Loan applications could not be loaded.", "error");
        setLoading(false);
      },
    );
  }, [showToast]);

  useEffect(() => {
    if (!selected) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelected(null);
        setReview(null);
      }
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [selected]);

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

  const openApplication = (item: LoanApplication) => {
    setSelected(item);
    setStatus(item.status);
    setStatusNote(item.statusNote);
    setReview({
      ...item.review,
      previousLoans: item.review.previousLoans.map((loan) => ({ ...loan })),
    });
  };

  const closeApplication = () => {
    setSelected(null);
    setReview(null);
  };

  const updateReview = <K extends keyof LoanReview>(
    key: K,
    value: LoanReview[K],
  ) =>
    setReview((current) => (current ? { ...current, [key]: value } : current));

  const saveApplication = async () => {
    if (!db || !selected || !review) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "loanApplications", selected.id), {
        status,
        statusNote: statusNote.trim(),
        review,
        updatedAt: serverTimestamp(),
      });
      setSelected({
        ...selected,
        status,
        statusNote: statusNote.trim(),
        review,
      });
      showToast("Loan assessment updated.");
    } catch (error) {
      console.error("Unable to update loan application.", error);
      showToast("Loan assessment could not be updated.", "error");
    } finally {
      setSaving(false);
    }
  };

  const removeApplication = async () => {
    if (!db || !deleteTarget) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, "loanApplications", deleteTarget.id));
      if (selected?.id === deleteTarget.id) closeApplication();
      setDeleteTarget(null);
      showToast("Loan application deleted.", "warning");
    } catch (error) {
      console.error("Unable to delete loan application.", error);
      showToast("Loan application could not be deleted.", "error");
    } finally {
      setDeleting(false);
    }
  };

  const exportApplication = async (format: "docx" | "pdf") => {
    if (!selected || !documentRef.current || exporting) return;
    setExporting(format);
    try {
      await downloadApplicationDocument(
        documentRef.current,
        `${selected.reference}-loan-application`,
        format,
      );
      showToast(`Loan application ${format.toUpperCase()} downloaded.`);
    } catch (error) {
      console.error(`Unable to export loan application as ${format}.`, error);
      showToast("The loan application file could not be generated.", "error");
    } finally {
      setExporting(null);
    }
  };

  const printApplication = async () => {
    if (!selected || !documentRef.current || exporting) return;
    setExporting("print");
    try {
      await printApplicationDocument(
        documentRef.current,
        `${selected.reference} loan application`,
      );
      showToast("Loan application opened for printing.");
    } catch (error) {
      console.error("Unable to print loan application.", error);
      showToast("The print view could not be opened.", "error");
    } finally {
      setExporting(null);
    }
  };

  return (
    <section className={styles.manager}>
      <div className={styles.toolbar}>
        <label>
          <Search aria-hidden="true" />
          <span className="srOnly">Search loan applications</span>
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
            setFilter(event.target.value as "all" | LoanStatus);
            setPage(1);
          }}
          aria-label="Filter loan applications by status"
        >
          <option value="all">All statuses</option>
          {loanStatuses.map((itemStatus) => (
            <option key={itemStatus} value={itemStatus}>
              {loanStatusLabels[itemStatus]}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className={styles.empty}>Loading loan applications…</p>
      ) : visible.length === 0 ? (
        <div className={styles.empty}>
          <FileSpreadsheet />
          <strong>No matching loan applications</strong>
          <span>Online loan submissions will appear here.</span>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                <th className={styles.numberColumn}>No.</th>
                <th>Reference</th>
                <th>Applicant</th>
                <th>Type of loan</th>
                <th>Amount applied</th>
                <th>Date filed</th>
                <th>Status</th>
                <th>
                  <span className="srOnly">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map((item, index) => (
                <tr key={item.id}>
                  <td className={styles.numberCell} data-label="No.">
                    {(currentPage - 1) * pageSize + index + 1}
                  </td>
                  <td data-label="Reference">
                    <button
                      className={styles.reference}
                      onClick={() => openApplication(item)}
                    >
                      {item.reference}
                    </button>
                  </td>
                  <td data-label="Applicant">
                    {item.applicantName}
                    <small>{item.applicantEmail || item.address}</small>
                  </td>
                  <td data-label="Loan type">{loanTypeLabels[item.typeOfLoan]}</td>
                  <td data-label="Amount">{formatPeso(item.amountApplied)}</td>
                  <td data-label="Submitted">{dateFiled(item)}</td>
                  <td data-label="Status">
                    <span className={`${styles.status} ${styles[item.status]}`}>
                      {loanStatusLabels[item.status]}
                    </span>
                  </td>
                  <td data-label="Actions">
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
        <nav className={styles.pagination} aria-label="Loan application pages">
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

      {selected && review && (
        <div
          className={styles.modalBackdrop}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeApplication();
          }}
        >
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="loan-document-title"
          >
            <div className={styles.modalBar}>
              <div className={styles.modalTitle}>
                <span>Official digital record</span>
                <strong id="loan-document-title">{selected.reference}</strong>
              </div>
              <section className={styles.modalActions} aria-label="Loan application file actions">
                <button
                  type="button"
                  onClick={() => void exportApplication("docx")}
                  disabled={exporting !== null}
                >
                  <Download aria-hidden="true" />
                  <span>{exporting === "docx" ? "Preparing…" : "DOCX"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => void exportApplication("pdf")}
                  disabled={exporting !== null}
                >
                  <Download aria-hidden="true" />
                  <span>{exporting === "pdf" ? "Preparing…" : "PDF"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => void printApplication()}
                  disabled={exporting !== null}
                  aria-busy={exporting === "print"}
                >
                  {exporting === "print" ? (
                    <LoaderCircle className={styles.spinner} aria-hidden="true" />
                  ) : (
                    <Printer aria-hidden="true" />
                  )}
                  <span>{exporting === "print" ? "Preparing…" : "Print"}</span>
                </button>
                <button
                  type="button"
                  className={styles.closeButton}
                  onClick={closeApplication}
                  aria-label="Close loan application"
                >
                  <X />
                </button>
              </section>
            </div>
            <footer className={styles.reviewBar}>
              <label>
                Status
                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as LoanStatus)
                  }
                >
                  {loanStatuses.map((itemStatus) => (
                    <option key={itemStatus} value={itemStatus}>
                      {loanStatusLabels[itemStatus]}
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
              <button onClick={() => void saveApplication()} disabled={saving}>
                {saving ? "Saving…" : "Save loan assessment"}
              </button>
            </footer>
            <div className={styles.documentWrap}>
              <article
                className={styles.document}
                ref={documentRef}
                data-application-export-page
              >
                <header className={styles.documentHeader}>
                  <img src={timgasLogo} alt="TIMGAS MPC cooperative logo" />
                  <div>
                    <p>Tinabangay sa Igsoong Mag-uuma Gasa Ni San Isidro</p>
                    <p>Multipurpose Cooperative (TIMGAS MPC)</p>
                    <small>Poblacion, Trinidad, Bohol</small>
                    <small>CDA Reg No. 9520-07005314 / CIN:0103070079</small>
                    <small>TIN: 006-120-972-000 NON VAT REG.</small>
                  </div>
                  <h2 id="loan-document-title">LOAN APPLICATION FORM</h2>
                </header>

                <section className={styles.twoColumnLines}>
                  <p>
                    <b>Date Filed:</b>
                    <span>{dateFiled(selected)}</span>
                  </p>
                  <p>
                    <b>Amount of CBU:</b>
                    <span>{formatPeso(review.cbuAmount)}</span>
                  </p>
                  <label>
                    <b>Date Released (optional):</b>
                    <input
                      type="date"
                      value={review.dateReleased}
                      onChange={(event) =>
                        updateReview("dateReleased", event.target.value)
                      }
                    />
                  </label>
                  <p>
                    <b>Amount of Savings:</b>
                    <span>{formatPeso(review.savingsAmount)}</span>
                  </p>
                </section>

                <p className={styles.statement}>
                  I, <span>{selected.applicantName}</span> of{" "}
                  <span>{ensureBoholAddress(selected.address)}</span> hereby applies for:
                </p>
                <p className={styles.line}>
                  <b>Applicant Gmail:</b>
                  <span>
                    {selected.applicantEmail ? (
                      <a href={`mailto:${selected.applicantEmail}`}>
                        {selected.applicantEmail}
                      </a>
                    ) : (
                      "Not provided in this application"
                    )}
                  </span>
                </p>
                <div className={styles.optionLine}>
                  <b>Type of loan:</b>
                  {loanTypeOptions.map((option) => (
                    <span
                      key={option.value}
                      className={
                        selected.typeOfLoan === option.value
                          ? styles.checked
                          : undefined
                      }
                    >
                      {selected.typeOfLoan === option.value ? "✓" : "□"}{" "}
                      {option.label}
                    </span>
                  ))}
                </div>
                <p className={styles.line}>
                  <b>Purpose of Loan:</b>
                  <span>{selected.purposeOfLoan}</span>
                </p>
                <div className={styles.optionLine}>
                  <b>Mode of Payment:</b>
                  {Object.entries(loanPaymentModeLabels).map(
                    ([value, label]) => (
                      <span
                        key={value}
                        className={
                          selected.paymentMode === value
                            ? styles.checked
                            : undefined
                        }
                      >
                        {selected.paymentMode === value ? "✓" : "□"} {label}
                      </span>
                    ),
                  )}
                </div>
                <p className={styles.line}>
                  <b>Number of months:</b>
                  <span>{selected.numberOfMonths}</span>
                </p>
                <section className={styles.twoColumnLines}>
                  <p>
                    <b>Amount Applied:</b>
                    <span>{formatPeso(selected.amountApplied)}</span>
                  </p>
                  <label>
                    <b>Amount Approved:</b>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={review.amountApproved ?? ""}
                      onChange={(event) =>
                        updateReview(
                          "amountApproved",
                          numberFromInput(event.target.value),
                        )
                      }
                    />
                  </label>
                </section>

                <h3>Asset Information:</h3>
                <table className={styles.formTable}>
                  <thead>
                    <tr>
                      <th>Property Description</th>
                      <th>Value</th>
                      <th>Property Description</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.assets.length > 0 ? (
                      Array.from(
                        { length: Math.ceil(selected.assets.length / 2) },
                        (_, row) => {
                          const left = selected.assets[row * 2];
                          const right = selected.assets[row * 2 + 1];
                          return (
                            <tr key={row}>
                              <td>
                                {left.propertyDescription || "Not described"}
                              </td>
                              <td>{formatPeso(left.value)}</td>
                              <td>{right?.propertyDescription || ""}</td>
                              <td>{right ? formatPeso(right.value) : ""}</td>
                            </tr>
                          );
                        },
                      )
                    ) : (
                      <tr>
                        <td className={styles.emptyRecord} colSpan={4}>
                          No asset information was provided.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                <h3>Debt Information:</h3>
                <table className={styles.formTable}>
                  <thead>
                    <tr>
                      <th>Source of Credit</th>
                      <th>Amount Granted</th>
                      <th>Outstanding Balance</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.debts.length > 0 ? (
                      selected.debts.map((debt, index) => (
                        <tr key={`${debt.sourceOfCredit}-${index}`}>
                          <td>{debt.sourceOfCredit || "Not specified"}</td>
                          <td>{formatPeso(debt.amountGranted)}</td>
                          <td>{formatPeso(debt.outstandingBalance)}</td>
                          <td>{debt.remarks || "—"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className={styles.emptyRecord} colSpan={4}>
                          No debt information was provided.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                <div className={styles.agreementText}>
                  <p>
                    I agree and abide the policies, rules and regulations
                    governing the credit services of the cooperative. I
                    authorized the cooperative to validate the above information
                    and gather when necessary. I also authorize the cooperative
                    to get any of my asset to settle my loan balances in case my
                    loan will matured.
                  </p>
                  <p>
                    As Co-maker hereof, I hereby expressly allow the borrower to
                    avail Restructuring of this loan in case the borrower failed
                    to pay his/her loan on the date of maturity without securing
                    my signature as co-maker and it remains valid.
                  </p>
                </div>

                <section className={styles.signatureGrid}>
                  <div>
                    <span>{selected.spouseName || "—"}</span>
                    <b>With marital consent: Spouse</b>
                  </div>
                  <div>
                    <span>{selected.agreement.applicantTypedName}</span>
                    <b>Applicant/Member Borrower</b>
                  </div>
                  <div>
                    <span>{selected.coMakers[0] || "—"}</span>
                    <b>CO-MAKER</b>
                  </div>
                  <div>
                    <span>{selected.coMakers[1] || "—"}</span>
                    <b>CO-MAKER</b>
                  </div>
                </section>

                <h3>Record of Previous Loans:</h3>
                <table
                  className={`${styles.formTable} ${styles.editableTable}`}
                >
                  <thead>
                    <tr>
                      <th>Type of Loan</th>
                      <th>Amount Granted</th>
                      <th>Outstanding Balance</th>
                      <th>Remarks</th>
                      <th>
                        <span className="srOnly">Remove</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {review.previousLoans.map((loan, index) => (
                      <tr key={index}>
                        <td>
                          <input
                            value={loan.typeOfLoan}
                            onChange={(event) =>
                              updateReview(
                                "previousLoans",
                                review.previousLoans.map((item, itemIndex) =>
                                  itemIndex === index
                                    ? {
                                        ...item,
                                        typeOfLoan: event.target.value,
                                      }
                                    : item,
                                ),
                              )
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={loan.amountGranted}
                            onChange={(event) =>
                              updateReview(
                                "previousLoans",
                                review.previousLoans.map((item, itemIndex) =>
                                  itemIndex === index
                                    ? {
                                        ...item,
                                        amountGranted: Number(
                                          event.target.value,
                                        ),
                                      }
                                    : item,
                                ),
                              )
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={loan.outstandingBalance}
                            onChange={(event) =>
                              updateReview(
                                "previousLoans",
                                review.previousLoans.map((item, itemIndex) =>
                                  itemIndex === index
                                    ? {
                                        ...item,
                                        outstandingBalance: Number(
                                          event.target.value,
                                        ),
                                      }
                                    : item,
                                ),
                              )
                            }
                          />
                        </td>
                        <td>
                          <input
                            value={loan.remarks}
                            onChange={(event) =>
                              updateReview(
                                "previousLoans",
                                review.previousLoans.map((item, itemIndex) =>
                                  itemIndex === index
                                    ? { ...item, remarks: event.target.value }
                                    : item,
                                ),
                              )
                            }
                          />
                        </td>
                        <td>
                          <button
                            onClick={() =>
                              updateReview(
                                "previousLoans",
                                review.previousLoans.filter(
                                  (_, itemIndex) => itemIndex !== index,
                                ),
                              )
                            }
                            aria-label={`Remove previous loan ${index + 1}`}
                          >
                            <Trash2 />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {review.previousLoans.length < 4 && (
                  <button
                    className={styles.addRow}
                    onClick={() =>
                      updateReview("previousLoans", [
                        ...review.previousLoans,
                        {
                          typeOfLoan: "",
                          amountGranted: 0,
                          outstandingBalance: 0,
                          remarks: "",
                        },
                      ])
                    }
                  >
                    <Plus /> Add previous loan
                  </button>
                )}

                <label className={styles.fullLine}>
                  <b>Assessing Coop Employee</b>
                  <input
                    value={review.assessingCoopEmployee}
                    onChange={(event) =>
                      updateReview("assessingCoopEmployee", event.target.value)
                    }
                  />
                </label>
                <h3>CRECOM ACTION:</h3>
                <textarea
                  className={styles.actionBox}
                  rows={4}
                  value={review.crecomAction}
                  onChange={(event) =>
                    updateReview("crecomAction", event.target.value)
                  }
                />
                <section className={styles.signatureGrid}>
                  <label>
                    <input
                      value={review.recommendingLoanAnalyst}
                      onChange={(event) =>
                        updateReview(
                          "recommendingLoanAnalyst",
                          event.target.value,
                        )
                      }
                    />
                    <b>Recommending Loan Analyst</b>
                  </label>
                  <label>
                    <input
                      value={review.lendingDepartmentManager}
                      onChange={(event) =>
                        updateReview(
                          "lendingDepartmentManager",
                          event.target.value,
                        )
                      }
                    />
                    <b>Lending Department Manager</b>
                  </label>
                </section>
                <section className={styles.decisionGrid}>
                  <label>
                    <input
                      type="radio"
                      checked={status === "approved"}
                      onChange={() => setStatus("approved")}
                    />{" "}
                    APPROVED
                  </label>
                  <label>
                    <input
                      type="radio"
                      checked={status === "disapproved"}
                      onChange={() => setStatus("disapproved")}
                    />{" "}
                    DISAPPROVED
                  </label>
                </section>
                <label className={styles.fullLine}>
                  <b>General Manager</b>
                  <input
                    value={review.generalManager}
                    onChange={(event) =>
                      updateReview("generalManager", event.target.value)
                    }
                  />
                </label>

                <h3>BOD’s Action (for P50,000.00 above loan)</h3>
                <textarea
                  className={styles.actionBox}
                  rows={4}
                  value={review.bodAction}
                  onChange={(event) =>
                    updateReview("bodAction", event.target.value)
                  }
                />
                <section className={styles.approvalSignature}>
                  <strong>Approved by:</strong>
                  <label>
                    <input
                      value={review.chairperson || review.approvedBy}
                      onChange={(event) =>
                        updateReview("chairperson", event.target.value)
                      }
                    />
                    <b>Chairperson</b>
                  </label>
                </section>
              </article>
            </div>
          </div>
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
            aria-labelledby="delete-loan-title"
            aria-describedby="delete-loan-description"
          >
            <div>
              <p>Permanent action</p>
              <h2 id="delete-loan-title">Delete this loan application?</h2>
              <p id="delete-loan-description">
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
