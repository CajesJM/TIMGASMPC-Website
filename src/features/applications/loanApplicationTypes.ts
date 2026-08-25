import {
  Timestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";

export const loanTypeOptions = [
  { value: "prodn", label: "Prod’n" },
  { value: "hon", label: "Hon." },
  { value: "salary", label: "Salary" },
  { value: "express", label: "Express" },
  { value: "sbl", label: "SBL" },
  { value: "mf_first", label: "MF (first field)" },
  { value: "mf_second", label: "MF (second field)" },
] as const;

export type LoanType = (typeof loanTypeOptions)[number]["value"];

export const loanTypeLabels = Object.fromEntries(
  loanTypeOptions.map((option) => [option.value, option.label]),
) as Record<LoanType, string>;

export const loanPaymentModes = [
  "daily",
  "weekly",
  "semi_monthly",
  "monthly",
] as const;

export type LoanPaymentMode = (typeof loanPaymentModes)[number];

export const loanPaymentModeLabels: Record<LoanPaymentMode, string> = {
  daily: "Daily",
  weekly: "Weekly",
  semi_monthly: "Semi-monthly",
  monthly: "Monthly",
};

export const loanStatuses = [
  "new",
  "in_review",
  "for_verification",
  "approved",
  "disapproved",
  "released",
] as const;

export type LoanStatus = (typeof loanStatuses)[number];

export const loanStatusLabels: Record<LoanStatus, string> = {
  new: "New",
  in_review: "In review",
  for_verification: "For verification",
  approved: "Approved",
  disapproved: "Disapproved",
  released: "Released",
};

export type LoanAsset = {
  propertyDescription: string;
  value: number;
};

export type LoanDebt = {
  sourceOfCredit: string;
  amountGranted: number;
  outstandingBalance: number;
  remarks: string;
};

export type PreviousLoan = {
  typeOfLoan: string;
  amountGranted: number;
  outstandingBalance: number;
  remarks: string;
};

export type LoanReview = {
  cbuAmount: number | null;
  savingsAmount: number | null;
  dateReleased: string;
  amountApproved: number | null;
  previousLoans: PreviousLoan[];
  assessingCoopEmployee: string;
  crecomAction: string;
  recommendingLoanAnalyst: string;
  lendingDepartmentManager: string;
  generalManager: string;
  bodAction: string;
  approvedBy: string;
  chairperson: string;
};

export type LoanApplication = {
  id: string;
  reference: string;
  applicantName: string;
  applicantEmail: string;
  address: string;
  typeOfLoan: LoanType;
  purposeOfLoan: string;
  paymentMode: LoanPaymentMode;
  numberOfMonths: number;
  amountApplied: number;
  assets: LoanAsset[];
  debts: LoanDebt[];
  spouseName: string;
  coMakers: string[];
  agreement: {
    version: string;
    accepted: boolean;
    applicantTypedName: string;
    coMakerAuthorizationAcknowledged: boolean;
  };
  privacyConsent: boolean;
  status: LoanStatus;
  statusNote: string;
  review: LoanReview;
  submittedAt: Timestamp | null;
  updatedAt: Timestamp | null;
};

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function number(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function optionalNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function isLoanType(value: unknown): value is LoanType {
  return loanTypeOptions.some((option) => option.value === value);
}

function isPaymentMode(value: unknown): value is LoanPaymentMode {
  return loanPaymentModes.includes(value as LoanPaymentMode);
}

function isLoanStatus(value: unknown): value is LoanStatus {
  return loanStatuses.includes(value as LoanStatus);
}

export function parseLoanApplication(
  snapshot: QueryDocumentSnapshot<DocumentData>,
): LoanApplication {
  const data = snapshot.data();
  const agreement = record(data.agreement);
  const review = record(data.review);

  return {
    id: snapshot.id,
    reference: text(data.reference) || snapshot.id,
    applicantName: text(data.applicantName) || "Name unavailable",
    applicantEmail: text(data.applicantEmail),
    address: text(data.address),
    typeOfLoan: isLoanType(data.typeOfLoan) ? data.typeOfLoan : "prodn",
    purposeOfLoan: text(data.purposeOfLoan),
    paymentMode: isPaymentMode(data.paymentMode) ? data.paymentMode : "monthly",
    numberOfMonths: number(data.numberOfMonths),
    amountApplied: number(data.amountApplied),
    assets: Array.isArray(data.assets)
      ? data.assets.slice(0, 6).map((item) => {
          const asset = record(item);
          return {
            propertyDescription: text(asset.propertyDescription),
            value: number(asset.value),
          };
        })
      : [],
    debts: Array.isArray(data.debts)
      ? data.debts.slice(0, 4).map((item) => {
          const debt = record(item);
          return {
            sourceOfCredit: text(debt.sourceOfCredit),
            amountGranted: number(debt.amountGranted),
            outstandingBalance: number(debt.outstandingBalance),
            remarks: text(debt.remarks),
          };
        })
      : [],
    spouseName: text(data.spouseName),
    coMakers: Array.isArray(data.coMakers)
      ? data.coMakers.slice(0, 2).map(text)
      : [],
    agreement: {
      version: text(agreement.version),
      accepted: agreement.accepted === true,
      applicantTypedName: text(agreement.applicantTypedName),
      coMakerAuthorizationAcknowledged:
        agreement.coMakerAuthorizationAcknowledged === true,
    },
    privacyConsent: data.privacyConsent === true,
    status: isLoanStatus(data.status) ? data.status : "new",
    statusNote: text(data.statusNote),
    review: {
      cbuAmount: optionalNumber(review.cbuAmount),
      savingsAmount: optionalNumber(review.savingsAmount),
      dateReleased: text(review.dateReleased),
      amountApproved: optionalNumber(review.amountApproved),
      previousLoans: Array.isArray(review.previousLoans)
        ? review.previousLoans.slice(0, 4).map((item) => {
            const previousLoan = record(item);
            return {
              typeOfLoan: text(previousLoan.typeOfLoan),
              amountGranted: number(previousLoan.amountGranted),
              outstandingBalance: number(previousLoan.outstandingBalance),
              remarks: text(previousLoan.remarks),
            };
          })
        : [],
      assessingCoopEmployee: text(review.assessingCoopEmployee),
      crecomAction: text(review.crecomAction),
      recommendingLoanAnalyst: text(review.recommendingLoanAnalyst),
      lendingDepartmentManager: text(review.lendingDepartmentManager),
      generalManager: text(review.generalManager),
      bodAction: text(review.bodAction),
      approvedBy: text(review.approvedBy),
      chairperson: text(review.chairperson),
    },
    submittedAt:
      data.submittedAt instanceof Timestamp ? data.submittedAt : null,
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt : null,
  };
}

export function formatPeso(value: number | null) {
  if (value === null) return "Not recorded";
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 2,
  }).format(value);
}
