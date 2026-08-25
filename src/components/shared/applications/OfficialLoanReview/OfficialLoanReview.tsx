import timgasLogo from "@/assets/images/brand/timgas-logo.png";
import { ensureBoholAddress } from "@/features/applications/boholLocations";
import {
  loanPaymentModeLabels,
  loanTypeOptions,
  type LoanPaymentMode,
  type LoanType,
} from "@/features/applications/loanApplicationTypes";
import styles from "@/styles/shared/applications/OfficialLoanReview.module.css";

type ReviewAsset = {
  propertyDescription?: string;
  value?: string | number;
};

type ReviewDebt = {
  sourceOfCredit?: string;
  amountGranted?: string | number;
  outstandingBalance?: string | number;
  remarks?: string;
};

export type OfficialLoanReviewData = {
  applicantName: string;
  applicantEmail: string;
  address: string;
  typeOfLoan: LoanType;
  purposeOfLoan: string;
  paymentMode: LoanPaymentMode;
  numberOfMonths: string | number;
  amountApplied: string | number;
  cbuAmount: string | number;
  dateReleased: string;
  savingsAmount: string | number;
  assets: ReviewAsset[];
  debts: ReviewDebt[];
  spouseName: string;
  applicantTypedName: string;
  coMakers: string[];
};

function formatPeso(value: string | number | undefined) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function OfficialLoanReview({ data }: { data: OfficialLoanReviewData }) {
  const applicantAddress = ensureBoholAddress(data.address);
  return (
    <div
      className={styles.viewport}
      aria-label="Official loan application preview"
    >
      <article className={styles.document}>
        <header className={styles.header}>
          <img src={timgasLogo} alt="TIMGAS MPC cooperative logo" />
          <div>
            <p>Tinabangay sa Igsoong Mag-uuma Gasa Ni San Isidro</p>
            <p>Multipurpose Cooperative (TIMGAS MPC)</p>
            <small>Poblacion, Trinidad, Bohol</small>
            <small>CDA Reg No. 9520-07005314 / CIN:0103070079</small>
            <small>TIN: 006-120-972-000 NON VAT REG.</small>
          </div>
          <h3>LOAN APPLICATION FORM</h3>
        </header>

        <section className={styles.twoColumnLines}>
          <p>
            <b>Date Filed:</b>
            <span>Recorded upon submission</span>
          </p>
          <p>
            <b>Amount of CBU:</b>
            <span>{formatPeso(data.cbuAmount)}</span>
          </p>
          <p>
            <b>Date Released:</b>
            <span>{data.dateReleased || "Not provided"}</span>
          </p>
          <p>
            <b>Amount of Savings:</b>
            <span>{formatPeso(data.savingsAmount)}</span>
          </p>
        </section>

        <p className={styles.statement}>
          I, <span>{data.applicantName}</span> of{" "}
          <span>{applicantAddress}</span> hereby applies for:
        </p>
        <p className={styles.line}>
          <b>Applicant Gmail:</b>
          <span>{data.applicantEmail}</span>
        </p>
        <div className={styles.optionLine}>
          <b>Type of loan:</b>
          {loanTypeOptions.map((option) => (
            <span
              key={option.value}
              className={
                data.typeOfLoan === option.value ? styles.checked : undefined
              }
            >
              {data.typeOfLoan === option.value ? "✓" : "□"} {option.label}
            </span>
          ))}
        </div>
        <p className={styles.line}>
          <b>Purpose of Loan:</b>
          <span>{data.purposeOfLoan}</span>
        </p>
        <div className={styles.optionLine}>
          <b>Mode of Payment:</b>
          {Object.entries(loanPaymentModeLabels).map(([value, label]) => (
            <span
              key={value}
              className={
                data.paymentMode === value ? styles.checked : undefined
              }
            >
              {data.paymentMode === value ? "✓" : "□"} {label}
            </span>
          ))}
        </div>
        <p className={styles.line}>
          <b>Number of months:</b>
          <span>{data.numberOfMonths}</span>
        </p>
        <section className={styles.twoColumnLines}>
          <p>
            <b>Amount Applied:</b>
            <span>{formatPeso(data.amountApplied)}</span>
          </p>
          <p>
            <b>Amount Approved:</b>
            <span>For TIMGAS MPC use</span>
          </p>
        </section>

        <h4>Asset Information:</h4>
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
            {data.assets.length > 0 ? (
              Array.from(
                { length: Math.ceil(data.assets.length / 2) },
                (_, row) => {
                  const left = data.assets[row * 2];
                  const right = data.assets[row * 2 + 1];
                  return (
                    <tr key={row}>
                      <td>{left.propertyDescription || "Not described"}</td>
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

        <h4>Debt Information:</h4>
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
            {data.debts.length > 0 ? (
              data.debts.map((debt, index) => (
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
            I agree and abide by the policies, rules, and regulations governing
            the credit services of the cooperative. I authorize the cooperative
            to validate the information above and gather additional information
            when necessary.
          </p>
          <p>
            As co-maker hereof, I acknowledge the restructuring authorization
            and continuing co-maker obligation stated in the official
            application form.
          </p>
        </div>

        <section className={styles.signatureGrid}>
          <div>
            <span>{data.spouseName || "—"}</span>
            <b>With marital consent: Spouse</b>
          </div>
          <div>
            <span>{data.applicantTypedName}</span>
            <b>Applicant/Member Borrower</b>
          </div>
          <div>
            <span>{data.coMakers[0] || "—"}</span>
            <b>CO-MAKER</b>
          </div>
          <div>
            <span>{data.coMakers[1] || "—"}</span>
            <b>CO-MAKER</b>
          </div>
        </section>
      </article>
    </div>
  );
}
