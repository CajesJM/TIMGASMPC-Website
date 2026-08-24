import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Plus,
  Send,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  useFieldArray,
  useForm,
  useWatch,
  type FieldPath,
} from "react-hook-form";
import { z } from "zod";
import {
  loanPaymentModeLabels,
  loanPaymentModes,
  loanTypeOptions,
} from "../../../features/applications/loanApplicationTypes";
import { db } from "../../../lib/firestore";
import { submitApplicationWithCaptcha } from "../../../lib/applicationSubmission";
import { OfficialLoanReview } from "../OfficialLoanReview/OfficialLoanReview";
import styles from "./LoanApplicationForm.module.css";

const agreementVersion = "Loan-Application-Form";
const maximumAssets = 6;
const maximumDebts = 4;
const maximumPurposeCharacters = 5_000;

const optionalText = (maximum = 160) => z.string().trim().max(maximum);
const requiredText = (label: string, maximum = 160) =>
  z.string().trim().min(1, `${label} is required.`).max(maximum);
const requiredAmount = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .refine((value) => Number.isFinite(Number(value)) && Number(value) > 0, {
      message: `${label} must be greater than zero.`,
    });
const optionalAmount = z
  .string()
  .trim()
  .refine(
    (value) => !value || (Number.isFinite(Number(value)) && Number(value) >= 0),
    { message: "Enter a valid amount." },
  );
const optionalDate = z
  .string()
  .trim()
  .refine((value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value), {
    message: "Enter a valid release date.",
  });

const loanApplicationSchema = z.object({
  applicantName: requiredText("Applicant name", 220),
  applicantEmail: z
    .string()
    .trim()
    .min(1, "Gmail address is required.")
    .max(254, "Gmail address is too long.")
    .email("Enter a valid Gmail address.")
    .refine((value) => value.toLowerCase().endsWith("@gmail.com"), {
      message: "Use a Gmail address ending in @gmail.com.",
    }),
  address: requiredText("Address", 300),
  typeOfLoan: z.enum(
    ["prodn", "hon", "salary", "express", "sbl", "mf_first", "mf_second"],
    { message: "Choose the loan type shown in the official form." },
  ),
  purposeOfLoan: requiredText("Purpose of loan", maximumPurposeCharacters),
  paymentMode: z.enum(loanPaymentModes, {
    message: "Choose a mode of payment.",
  }),
  numberOfMonths: z
    .string()
    .trim()
    .min(1, "Number of months is required.")
    .refine(
      (value) =>
        Number.isInteger(Number(value)) &&
        Number(value) >= 1 &&
        Number(value) <= 120,
      { message: "Enter a whole number from 1 to 120." },
    ),
  amountApplied: requiredAmount("Amount applied"),
  cbuAmount: requiredAmount("Amount of CBU"),
  dateReleased: optionalDate,
  savingsAmount: requiredAmount("Amount of savings"),
  assets: z
    .array(
      z.object({
        propertyDescription: optionalText(200),
        value: optionalAmount,
      }),
    )
    .max(maximumAssets),
  debts: z
    .array(
      z.object({
        sourceOfCredit: optionalText(180),
        amountGranted: optionalAmount,
        outstandingBalance: optionalAmount,
        remarks: optionalText(250),
      }),
    )
    .max(maximumDebts),
  spouseName: optionalText(220),
  coMakerOne: optionalText(220),
  coMakerTwo: optionalText(220),
  applicantTypedName: requiredText("Typed applicant name", 220),
  agreementAccepted: z.boolean().refine(Boolean, {
    message: "You must accept the loan agreement.",
  }),
  coMakerAuthorizationAcknowledged: z.boolean().refine(Boolean, {
    message: "You must acknowledge the co-maker authorization statement.",
  }),
  privacyConsent: z.boolean().refine(Boolean, {
    message:
      "You must consent to the review and validation of your information.",
  }),
  website: z.string().max(0),
});

type LoanFormValues = z.infer<typeof loanApplicationSchema>;

const defaultValues: LoanFormValues = {
  applicantName: "",
  applicantEmail: "",
  address: "",
  typeOfLoan: "prodn",
  purposeOfLoan: "",
  paymentMode: "monthly",
  numberOfMonths: "",
  amountApplied: "",
  cbuAmount: "",
  dateReleased: "",
  savingsAmount: "",
  assets: [],
  debts: [],
  spouseName: "",
  coMakerOne: "",
  coMakerTwo: "",
  applicantTypedName: "",
  agreementAccepted: false,
  coMakerAuthorizationAcknowledged: false,
  privacyConsent: false,
  website: "",
};

const steps = [
  "Loan details",
  "Asset information",
  "Debt information",
  "Consent and co-makers",
  "Review and submit",
];

const stepFields: FieldPath<LoanFormValues>[][] = [
  [
    "applicantName",
    "applicantEmail",
    "address",
    "typeOfLoan",
    "purposeOfLoan",
    "paymentMode",
    "numberOfMonths",
    "amountApplied",
    "cbuAmount",
    "dateReleased",
    "savingsAmount",
  ],
  ["assets"],
  ["debts"],
  [
    "applicantTypedName",
    "agreementAccepted",
    "coMakerAuthorizationAcknowledged",
    "privacyConsent",
  ],
  [],
];

function createReference() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const bytes = new Uint8Array(3);
  window.crypto.getRandomValues(bytes);
  const suffix = Array.from(bytes, (byte) => byte.toString(36).padStart(2, "0"))
    .join("")
    .toUpperCase()
    .slice(0, 6);
  return `TIMGAS-LOAN-${date}-${suffix}`;
}

function ErrorMessage({ message }: { message?: string }) {
  return message ? (
    <small className={styles.fieldError} role="alert">
      {message}
    </small>
  ) : null;
}

export function LoanApplicationForm({
  recaptchaToken,
}: {
  recaptchaToken: string;
}) {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submittedReference, setSubmittedReference] = useState("");
  const [reviewConfirmed, setReviewConfirmed] = useState(false);
  const [hasReachedStepEnd, setHasReachedStepEnd] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const {
    register,
    control,
    handleSubmit,
    trigger,
    reset,
    formState: { errors },
  } = useForm<LoanFormValues>({
    resolver: zodResolver(loanApplicationSchema),
    defaultValues,
    mode: "onTouched",
  });
  const assets = useFieldArray({ control, name: "assets" });
  const debts = useFieldArray({ control, name: "debts" });
  const values = useWatch({ control });
  const purposeCharacterCount = values.purposeOfLoan?.length ?? 0;
  const requiredConsentsAccepted = Boolean(
    values.agreementAccepted &&
    values.coMakerAuthorizationAcknowledged &&
    values.privacyConsent,
  );

  useEffect(() => {
    const scrollContainer = formRef.current?.parentElement;
    if (!scrollContainer) return undefined;

    const updateActionVisibility = () => {
      const remaining =
        scrollContainer.scrollHeight -
        scrollContainer.scrollTop -
        scrollContainer.clientHeight;
      setHasReachedStepEnd(remaining <= 8);
    };

    const frame = window.requestAnimationFrame(updateActionVisibility);
    scrollContainer.addEventListener("scroll", updateActionVisibility, {
      passive: true,
    });
    window.addEventListener("resize", updateActionVisibility);

    return () => {
      window.cancelAnimationFrame(frame);
      scrollContainer.removeEventListener("scroll", updateActionVisibility);
      window.removeEventListener("resize", updateActionVisibility);
    };
  }, [step]);

  const moveToStep = (nextStep: number) => {
    setReviewConfirmed(false);
    setStep(nextStep);
    window.requestAnimationFrame(() => {
      const form = formRef.current;
      if (typeof form?.scrollIntoView === "function") {
        form.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  };

  const continueForm = async () => {
    const valid = await trigger(stepFields[step], { shouldFocus: true });
    if (valid) moveToStep(Math.min(step + 1, steps.length - 1));
  };

  const submitApplication = async (data: LoanFormValues) => {
    setSubmitError("");
    if (!db) {
      setSubmitError(
        "Online submission is temporarily unavailable. Download the official loan form or contact the TIMGAS office.",
      );
      return;
    }

    setSubmitting(true);
    try {
      const reference = createReference();
      const assetRecords = data.assets
        .filter((asset) => asset.propertyDescription || asset.value)
        .map((asset) => ({
          propertyDescription: asset.propertyDescription,
          value: Number(asset.value || 0),
        }));
      const debtRecords = data.debts
        .filter((debt) => Object.values(debt).some(Boolean))
        .map((debt) => ({
          sourceOfCredit: debt.sourceOfCredit,
          amountGranted: Number(debt.amountGranted || 0),
          outstandingBalance: Number(debt.outstandingBalance || 0),
          remarks: debt.remarks,
        }));

      await submitApplicationWithCaptcha(
        "loanApplications",
        {
          schemaVersion: 1,
          source: "online",
          reference,
          applicantName: data.applicantName,
          applicantEmail: data.applicantEmail.toLowerCase(),
          address: data.address,
          typeOfLoan: data.typeOfLoan,
          purposeOfLoan: data.purposeOfLoan,
          paymentMode: data.paymentMode,
          numberOfMonths: Number(data.numberOfMonths),
          amountApplied: Number(data.amountApplied),
          assets: assetRecords,
          debts: debtRecords,
          spouseName: data.spouseName,
          coMakers: [data.coMakerOne, data.coMakerTwo].filter(Boolean),
          agreement: {
            version: agreementVersion,
            accepted: data.agreementAccepted,
            applicantTypedName: data.applicantTypedName,
            coMakerAuthorizationAcknowledged:
              data.coMakerAuthorizationAcknowledged,
          },
          privacyConsent: data.privacyConsent,
          status: "new",
          statusNote: "",
          review: {
            cbuAmount: Number(data.cbuAmount),
            savingsAmount: Number(data.savingsAmount),
            dateReleased: data.dateReleased,
            amountApproved: null,
            previousLoans: [],
            assessingCoopEmployee: "",
            crecomAction: "",
            recommendingLoanAnalyst: "",
            lendingDepartmentManager: "",
            generalManager: "",
            bodAction: "",
            approvedBy: "",
            chairperson: "",
          },
        },
        recaptchaToken,
      );

      setSubmittedReference(reference);
      reset(defaultValues);
      setReviewConfirmed(false);
      setStep(0);
    } catch (error) {
      console.error("Unable to submit the loan application.", error);
      setSubmitError(
        "Your loan application could not be submitted. Check your connection and try again, or download the manual form.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const submitFromReview = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (step < steps.length - 1) {
      void continueForm();
      return;
    }

    if (!reviewConfirmed || submitting) return;
    void handleSubmit(submitApplication)(event);
  };

  if (submittedReference) {
    return (
      <section className={styles.success} aria-live="polite">
        <CheckCircle2 aria-hidden="true" />
        <p className="eyebrow">Loan application received</p>
        <h3>Your application is ready for manager review.</h3>
        <p>
          Save your reference number: <strong>{submittedReference}</strong>
        </p>
        <p>
          Submission does not mean the loan is approved. TIMGAS MPC may require
          supporting documents, validation, co-maker signatures, and an office
          visit before acting on the application.
        </p>
        <button type="button" onClick={() => setSubmittedReference("")}>
          Submit another loan application
        </button>
      </section>
    );
  }

  return (
    <div
      className={styles.formShell}
      ref={formRef}
      id="online-loan-application"
    >
      <div className={styles.formIntro}>
        <div>
          <p className="eyebrow">Official online loan application</p>
          <h3>Loan application form</h3>
          <p>
            Based on the official TIMGAS MPC spreadsheet. Fields marked with an
            asterisk are required for online submission.
          </p>
        </div>
        <span>
          Step {step + 1} of {steps.length}
        </span>
      </div>

      <ol className={styles.progress} aria-label="Loan application progress">
        {steps.map((label, index) => (
          <li
            key={label}
            className={
              index === step
                ? styles.currentStep
                : index < step
                  ? styles.completedStep
                  : undefined
            }
            aria-current={index === step ? "step" : undefined}
          >
            <span>{index < step ? <CheckCircle2 /> : index + 1}</span>
            <small>{label}</small>
          </li>
        ))}
      </ol>

      <form onSubmit={submitFromReview} noValidate>
        <div className={styles.honeypot} aria-hidden="true">
          <label>
            Website
            <input {...register("website")} tabIndex={-1} />
          </label>
        </div>

        {step === 0 && (
          <fieldset>
            <legend>Borrower and loan information</legend>
            <p className={styles.sectionHelp}>
              Enter the borrower information and the CBU, savings, and release
              details requested in the official form.
            </p>
            <section
              className={styles.cooperativeFields}
              aria-labelledby="loan-cooperative-fields-title"
            >
              <div>
                <span>Applicant-provided loan record</span>
                <strong id="loan-cooperative-fields-title">
                  CBU, savings, and release information
                </strong>
              </div>
              <div className={styles.applicantRecordFields}>
                <label>
                  Amount of CBU (₱) *
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    inputMode="decimal"
                    {...register("cbuAmount")}
                  />
                  <ErrorMessage message={errors.cbuAmount?.message} />
                </label>
                <label>
                  Date released
                  <input type="date" {...register("dateReleased")} />
                  <ErrorMessage message={errors.dateReleased?.message} />
                </label>
                <label>
                  Amount of savings (₱) *
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    inputMode="decimal"
                    {...register("savingsAmount")}
                  />
                  <ErrorMessage message={errors.savingsAmount?.message} />
                </label>
              </div>
              <p className={styles.cooperativeNote}>
                <strong>Date filed</strong> is recorded automatically.{" "}
                <strong>Amount approved</strong> is completed by authorized
                TIMGAS MPC personnel after assessment.
              </p>
            </section>
            <div className={styles.gridTwo}>
              <label>
                Applicant/member borrower *
                <span aria-hidden="true" />
                <input autoComplete="name" {...register("applicantName")} />
                <ErrorMessage message={errors.applicantName?.message} />
              </label>
              <label>
                Gmail address *
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="applicant@gmail.com"
                  {...register("applicantEmail")}
                />
                <span>
                  TIMGAS MPC may use this address for application updates.
                </span>
                <ErrorMessage message={errors.applicantEmail?.message} />
              </label>
              <label>
                Address in Bohol, Philippines *
                <input autoComplete="street-address" {...register("address")} />
                <ErrorMessage message={errors.address?.message} />
              </label>
            </div>
            <div className={styles.loanTypes}>
              <span>Type of loan *</span>
              {loanTypeOptions.map((option) => (
                <label key={option.value}>
                  <input
                    type="radio"
                    value={option.value}
                    {...register("typeOfLoan")}
                  />
                  {option.label}
                </label>
              ))}
            </div>
            <ErrorMessage message={errors.typeOfLoan?.message} />
            <label>
              Purpose of loan *
              <textarea
                rows={5}
                maxLength={maximumPurposeCharacters}
                aria-describedby="loan-purpose-character-count"
                {...register("purposeOfLoan")}
              />
              <span
                id="loan-purpose-character-count"
                className={styles.characterCount}
              >
                {purposeCharacterCount.toLocaleString()} /{" "}
                {maximumPurposeCharacters.toLocaleString()} characters
              </span>
              <ErrorMessage message={errors.purposeOfLoan?.message} />
            </label>
            <div className={styles.gridThree}>
              <label>
                Mode of payment *
                <select {...register("paymentMode")}>
                  {loanPaymentModes.map((mode) => (
                    <option key={mode} value={mode}>
                      {loanPaymentModeLabels[mode]}
                    </option>
                  ))}
                </select>
                <ErrorMessage message={errors.paymentMode?.message} />
              </label>
              <label>
                Number of months *
                <input
                  type="number"
                  min="1"
                  max="120"
                  inputMode="numeric"
                  {...register("numberOfMonths")}
                />
                <ErrorMessage message={errors.numberOfMonths?.message} />
              </label>
              <label>
                Amount applied (₱) *
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  inputMode="decimal"
                  {...register("amountApplied")}
                />
                <ErrorMessage message={errors.amountApplied?.message} />
              </label>
            </div>
          </fieldset>
        )}

        {step === 1 && (
          <fieldset>
            <legend>Asset information</legend>
            <p className={styles.sectionHelp}>
              Enter the property descriptions and values requested in the
              official form. You may add up to six assets.
            </p>
            <div className={styles.listHeading}>
              <strong>Properties</strong>
              <button
                type="button"
                disabled={assets.fields.length >= maximumAssets}
                onClick={() =>
                  assets.append({ propertyDescription: "", value: "" })
                }
              >
                <Plus /> Add asset
              </button>
            </div>
            {assets.fields.length === 0 ? (
              <p className={styles.emptyList}>
                No asset entered. Add one if applicable.
              </p>
            ) : (
              assets.fields.map((field, index) => (
                <div className={styles.entryRow} key={field.id}>
                  <label>
                    Property description
                    <input
                      {...register(`assets.${index}.propertyDescription`)}
                    />
                  </label>
                  <label>
                    Value (₱)
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      inputMode="decimal"
                      {...register(`assets.${index}.value`)}
                    />
                    <ErrorMessage
                      message={errors.assets?.[index]?.value?.message}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => assets.remove(index)}
                    aria-label={`Remove asset ${index + 1}`}
                  >
                    <Trash2 />
                  </button>
                </div>
              ))
            )}
          </fieldset>
        )}

        {step === 2 && (
          <fieldset>
            <legend>Debt information</legend>
            <p className={styles.sectionHelp}>
              Enter existing credit information as requested in the official
              form. You may add up to four records.
            </p>
            <div className={styles.listHeading}>
              <strong>Sources of credit</strong>
              <button
                type="button"
                disabled={debts.fields.length >= maximumDebts}
                onClick={() =>
                  debts.append({
                    sourceOfCredit: "",
                    amountGranted: "",
                    outstandingBalance: "",
                    remarks: "",
                  })
                }
              >
                <Plus /> Add debt record
              </button>
            </div>
            {debts.fields.length === 0 ? (
              <p className={styles.emptyList}>No debt record entered.</p>
            ) : (
              debts.fields.map((field, index) => (
                <div className={styles.debtEntry} key={field.id}>
                  <label>
                    Source of credit
                    <input {...register(`debts.${index}.sourceOfCredit`)} />
                  </label>
                  <label>
                    Amount granted (₱)
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      {...register(`debts.${index}.amountGranted`)}
                    />
                    <ErrorMessage
                      message={errors.debts?.[index]?.amountGranted?.message}
                    />
                  </label>
                  <label>
                    Outstanding balance (₱)
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      {...register(`debts.${index}.outstandingBalance`)}
                    />
                    <ErrorMessage
                      message={
                        errors.debts?.[index]?.outstandingBalance?.message
                      }
                    />
                  </label>
                  <label>
                    Remarks
                    <input {...register(`debts.${index}.remarks`)} />
                  </label>
                  <button
                    type="button"
                    onClick={() => debts.remove(index)}
                    aria-label={`Remove debt record ${index + 1}`}
                  >
                    <Trash2 />
                  </button>
                </div>
              ))
            )}
          </fieldset>
        )}

        {step === 3 && (
          <fieldset>
            <legend>Agreement, marital consent, and co-makers</legend>
            <div className={styles.agreementNotice}>
              <ShieldCheck aria-hidden="true" />
              <div>
                <h4>Official loan agreement</h4>
                <p>
                  You agree to abide by the policies, rules, and regulations
                  governing the cooperative’s credit services; authorize TIMGAS
                  MPC to validate the information and gather information when
                  necessary; and acknowledge the asset-settlement provision in
                  the official form if a matured loan remains unpaid.
                </p>
              </div>
            </div>
            <div className={styles.gridTwo}>
              <label>
                Spouse / marital consent
                <input {...register("spouseName")} />
                <span>Optional</span>
              </label>
              <label>
                Applicant/member borrower typed name *
                <input {...register("applicantTypedName")} />
                <ErrorMessage message={errors.applicantTypedName?.message} />
              </label>
              <label>
                Co-maker 1 <span>Signature still verified by TIMGAS</span>
                <input {...register("coMakerOne")} />
              </label>
              <label>
                Co-maker 2 <span>Signature still verified by TIMGAS</span>
                <input {...register("coMakerTwo")} />
              </label>
            </div>
            <label className={styles.checkRow}>
              <input type="checkbox" {...register("agreementAccepted", { setValueAs: v => v === true || v === 'on' || v === 'true' })} />
              <span>
                I have reviewed and accept the official loan agreement. I
                understand TIMGAS MPC may require handwritten signatures and
                supporting documents. *
              </span>
            </label>
            <ErrorMessage message={errors.agreementAccepted?.message} />
            <label className={styles.checkRow}>
              <input
                type="checkbox"
                {...register("coMakerAuthorizationAcknowledged", { setValueAs: v => v === true || v === 'on' || v === 'true' })}
              />
              <span>
                I acknowledge the official co-maker statement allowing loan
                restructuring after failure to pay at maturity without obtaining
                a new co-maker signature, while the co-maker obligation remains
                valid. *
              </span>
            </label>
            <ErrorMessage
              message={errors.coMakerAuthorizationAcknowledged?.message}
            />
            <label className={styles.checkRow}>
              <input type="checkbox" {...register("privacyConsent", { setValueAs: v => v === true || v === 'on' || v === 'true' })} />
              <span>
                I authorize TIMGAS MPC to collect, validate, and review the
                personal and financial information submitted for this loan
                application. *
              </span>
            </label>
            <ErrorMessage message={errors.privacyConsent?.message} />
          </fieldset>
        )}

        {step === 4 && (
          <fieldset>
            <legend>Review and submit</legend>
            <p className={styles.sectionHelp}>
              Review the information below before sending it to the TIMGAS
              manager.
            </p>
            <OfficialLoanReview
              data={{
                applicantName: values.applicantName ?? "",
                applicantEmail: values.applicantEmail ?? "",
                address: values.address ?? "",
                typeOfLoan: values.typeOfLoan ?? "prodn",
                purposeOfLoan: values.purposeOfLoan ?? "",
                paymentMode: values.paymentMode ?? "monthly",
                numberOfMonths: values.numberOfMonths ?? "",
                amountApplied: values.amountApplied ?? "",
                cbuAmount: values.cbuAmount ?? "",
                dateReleased: values.dateReleased ?? "",
                savingsAmount: values.savingsAmount ?? "",
                assets: values.assets ?? [],
                debts: values.debts ?? [],
                spouseName: values.spouseName ?? "",
                applicantTypedName: values.applicantTypedName ?? "",
                coMakers: [values.coMakerOne, values.coMakerTwo].filter(
                  (name): name is string => Boolean(name),
                ),
              }}
            />
            <div className={styles.finalNotice}>
              <ShieldCheck />
              <p>
                This application is private. Only an authorized TIMGAS manager
                can read and process it. Online submission is not loan approval.
              </p>
            </div>
            <label
              className={`${styles.checkRow} ${styles.reviewConfirmation}`}
            >
              <input
                type="checkbox"
                checked={reviewConfirmed}
                onChange={(event) => setReviewConfirmed(event.target.checked)}
              />
              <span>
                I have reviewed the information above and I am ready to submit
                this loan application. *
              </span>
            </label>
          </fieldset>
        )}

        {submitError && (
          <p className={styles.submitError} role="alert">
            {submitError}
          </p>
        )}
        <div
          className={`${styles.formActions} ${
            hasReachedStepEnd ? "" : styles.mobileActionsHidden
          }`}
        >
          {step > 0 && (
            <button type="button" onClick={() => moveToStep(step - 1)}>
              <ArrowLeft /> Previous
            </button>
          )}
          {step < steps.length - 1 ? (
            <button
              type="button"
              disabled={step === 3 && !requiredConsentsAccepted}
              onClick={() => void continueForm()}
            >
              Continue <ArrowRight />
            </button>
          ) : (
            <button type="submit" disabled={submitting || !reviewConfirmed}>
              <Send /> {submitting ? "Submitting…" : "Submit loan application"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
