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
import { useRef, useState, type FormEvent } from "react";
import {
  useFieldArray,
  useForm,
  useWatch,
  type FieldPath,
} from "react-hook-form";
import { z } from "zod";
import { db } from "../../../lib/firestore";
import { submitApplicationWithCaptcha } from "../../../lib/applicationSubmission";
import { OfficialMembershipReview } from "../OfficialMembershipReview/OfficialMembershipReview";
import styles from "./MembershipApplicationForm.module.css";

const agreementVersion = "Membership-Application-Form-Revised-2023";
const maximumDependents = 8;
const philippineValidIdTypes = [
  "Philippine Identification (PhilID / ePhilID / Digital National ID)",
  "Philippine Passport",
  "LTO Driver's License",
  "LTO Student Permit",
  "Professional Regulation Commission (PRC) ID",
  "Unified Multi-Purpose ID (UMID)",
  "Social Security System (SSS) ID",
  "Government Service Insurance System (GSIS) eCard",
  "Postal ID",
  "COMELEC Voter's ID / Certification",
  "Senior Citizen ID",
  "Persons with Disability (PWD) ID",
  "PhilHealth ID",
  "Pag-IBIG Loyalty Card",
  "BIR TIN ID",
  "NBI Clearance",
  "PNP Police Clearance",
  "Barangay ID",
  "AFP ID",
  "PNP ID",
  "OWWA ID",
  "Seafarer's Identification and Record Book",
  "Integrated Bar of the Philippines (IBP) ID",
  "License to Own and Possess Firearms",
  "Alien Certificate of Registration (ACR I-Card)",
  "Other government-issued photo ID",
] as const;

const optionalText = (maximum = 120) => z.string().trim().max(maximum);
const requiredText = (label: string, maximum = 120) =>
  z.string().trim().min(1, `${label} is required.`).max(maximum);

const applicationSchema = z
  .object({
    membershipType: z.enum(["associate", "regular"], {
      message: "Choose a membership type.",
    }),
    departmentName: optionalText(),
    tinNumber: z
      .string()
      .trim()
      .max(30)
      .regex(/^\d*$/, "TIN number can contain numbers only."),
    pmesDate: optionalText(10),
    applicantEmail: z.string().trim().min(1, "Gmail address is required.").max(254).email("Enter a valid Gmail address.").refine((value) => value.toLowerCase().endsWith("@gmail.com"), { message: "Use a Gmail address ending in @gmail.com." }),
    familyName: requiredText("Family name"),
    givenName: requiredText("Given name"),
    middleName: optionalText(),
    nickname: optionalText(60),
    sex: requiredText("Sex", 30),
    civilStatus: requiredText("Civil status", 40),
    occupation: optionalText(),
    dateOfBirth: requiredText("Date of birth", 10),
    placeOfBirth: requiredText("Place of birth", 180),
    address: requiredText("Address", 300),
    cellphone: z
      .string()
      .regex(
        /^[1-9]\d{9}$/,
        "Enter 10 digits after +63. The number cannot start with 0.",
      ),
    validIdType: z.string().refine(
      (value) =>
        philippineValidIdTypes.includes(
          value as (typeof philippineValidIdTypes)[number],
        ),
      "Choose a valid ID type.",
    ),
    validIdNumber: z
      .string()
      .trim()
      .min(1, "Valid ID number is required.")
      .max(80)
      .regex(/^\d+$/, "Valid ID number can contain numbers only."),
    motherMaidenName: optionalText(150),
    fatherFullName: optionalText(150),
    spouseName: optionalText(150),
    spouseDateOfBirth: optionalText(10),
    dependents: z
      .array(
        z.object({
          name: optionalText(150),
          dateOfBirth: optionalText(10),
          age: optionalText(3),
          relationship: optionalText(60),
        }),
      )
      .max(maximumDependents),
    husbandIncomeSource: optionalText(160),
    husbandEmployer: optionalText(180),
    wifeIncomeSource: optionalText(160),
    wifeEmployer: optionalText(180),
    sector: z.enum(["arb", "arb_household", "non_arb", "rural_women"], {
      message: "Choose the sector stated in the form.",
    }),
    educationalAttainment: optionalText(150),
    affiliationOrganization: optionalText(180),
    affiliationPosition: optionalText(100),
    accusedOrConvicted: z.enum(["no", "yes"], {
      message: "Answer the crime-disclosure question.",
    }),
    crimeDetails: optionalText(5000),
    recommenderName: optionalText(150),
    typedName: requiredText("Typed applicant name", 180),
    agreementAccepted: z.boolean().refine((value) => value, {
      message: "You must acknowledge the membership agreement.",
    }),
    privacyConsent: z.boolean().refine((value) => value, {
      message: "You must consent to the application data being reviewed.",
    }),
    website: z.string().max(0),
  })
  .superRefine((data, context) => {
    if (data.accusedOrConvicted === "yes" && !data.crimeDetails.trim()) {
      context.addIssue({
        code: "custom",
        path: ["crimeDetails"],
        message: "Provide the requested details.",
      });
    }

    data.dependents.forEach((dependent, index) => {
      const hasAnyValue = Object.values(dependent).some(Boolean);
      if (hasAnyValue && !dependent.name) {
        context.addIssue({
          code: "custom",
          path: ["dependents", index, "name"],
          message: "Enter the dependent’s name.",
        });
      }
    });
  });

type ApplicationFormValues = z.infer<typeof applicationSchema>;

const defaultValues: ApplicationFormValues = {
  membershipType: "associate",
  departmentName: "",
  tinNumber: "",
  pmesDate: "",
  applicantEmail: "",
  familyName: "",
  givenName: "",
  middleName: "",
  nickname: "",
  sex: "",
  civilStatus: "",
  occupation: "",
  dateOfBirth: "",
  placeOfBirth: "",
  address: "",
  cellphone: "",
  validIdType: "",
  validIdNumber: "",
  motherMaidenName: "",
  fatherFullName: "",
  spouseName: "",
  spouseDateOfBirth: "",
  dependents: [],
  husbandIncomeSource: "",
  husbandEmployer: "",
  wifeIncomeSource: "",
  wifeEmployer: "",
  sector: "arb",
  educationalAttainment: "",
  affiliationOrganization: "",
  affiliationPosition: "",
  accusedOrConvicted: "no",
  crimeDetails: "",
  recommenderName: "",
  typedName: "",
  agreementAccepted: false,
  privacyConsent: false,
  website: "",
};

const steps = [
  "Membership and personal details",
  "Family and household information",
  "Background information",
  "Membership agreement",
  "Review and submit",
];

const stepFields: FieldPath<ApplicationFormValues>[][] = [
  [
    "membershipType",
    "applicantEmail",
    "familyName",
    "givenName",
    "sex",
    "civilStatus",
    "dateOfBirth",
    "placeOfBirth",
    "address",
    "cellphone",
    "validIdType",
    "validIdNumber",
  ],
  [],
  ["sector", "accusedOrConvicted", "crimeDetails"],
  ["typedName", "agreementAccepted", "privacyConsent"],
  [],
];

const sectorLabels: Record<ApplicationFormValues["sector"], string> = {
  arb: "ARB",
  arb_household: "ARB household",
  non_arb: "Non-ARB",
  rural_women: "Rural women",
};

const agreementTerms = [
  "Comply with the cooperative’s Articles of Cooperation, By-Laws, policies, General Assembly decisions, and directives of duly constituted authorities.",
  "Participate in the cooperative’s capital build-up and savings mobilization according to the amounts and schedules stated in the revised 2023 form.",
  "Attend meetings, conferences, seminars, and the prescribed Basic Cooperative Course when required.",
  "Follow the membership, regularization, loan, share-capital, savings, and resignation procedures stated in the official form.",
  "Acknowledge that the Board of Directors may apply sanctions allowed by the cooperative’s governing documents when obligations are not met.",
];

function createReference() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const bytes = new Uint8Array(3);
  window.crypto.getRandomValues(bytes);
  const suffix = Array.from(bytes, (byte) =>
    byte.toString(36).padStart(2, "0"),
  )
    .join("")
    .toUpperCase()
    .slice(0, 6);
  return `TIMGAS-${date}-${suffix}`;
}

function ErrorMessage({ message }: { message?: string }) {
  return message ? (
    <small className={styles.fieldError} role="alert">
      {message}
    </small>
  ) : null;
}

export function MembershipApplicationForm({ recaptchaToken }: { recaptchaToken: string }) {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submittedReference, setSubmittedReference] = useState("");
  const [reviewConfirmed, setReviewConfirmed] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const {
    register,
    control,
    handleSubmit,
    trigger,
    reset,
    formState: { errors },
  } = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues,
    mode: "onTouched",
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "dependents",
  });
  const values = useWatch({ control });
  const stepFourConsentsAccepted = Boolean(
    values.agreementAccepted && values.privacyConsent,
  );

  const moveToStep = (nextStep: number) => {
    setReviewConfirmed(false);
    setStep(nextStep);
    window.requestAnimationFrame(() =>
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  };

  const continueForm = async () => {
    const valid = await trigger(stepFields[step], { shouldFocus: true });
    if (valid) moveToStep(Math.min(step + 1, steps.length - 1));
  };

  const submitApplication = async (data: ApplicationFormValues) => {
    setSubmitError("");
    if (!db) {
      setSubmitError(
        "Online submission is temporarily unavailable. Please download the form or contact the TIMGAS office.",
      );
      return;
    }

    setSubmitting(true);
    try {
      const reference = createReference();
      const dependents = data.dependents.filter((dependent) =>
        Object.values(dependent).some(Boolean),
      );

      await submitApplicationWithCaptcha("applications", {
        schemaVersion: 1,
        source: "online",
        reference,
        applicantName: [data.givenName, data.middleName, data.familyName]
          .filter(Boolean)
          .join(" "),
        applicantEmail: data.applicantEmail.toLowerCase(),
        applicationType: data.membershipType,
        profile: {
          departmentName: data.departmentName,
          tinNumber: data.tinNumber,
          pmesDate: data.pmesDate,
          familyName: data.familyName,
          givenName: data.givenName,
          middleName: data.middleName,
          nickname: data.nickname,
          sex: data.sex,
          civilStatus: data.civilStatus,
          occupation: data.occupation,
          dateOfBirth: data.dateOfBirth,
          placeOfBirth: data.placeOfBirth,
          address: data.address,
          cellphone: `+63${data.cellphone}`,
          validIdType: data.validIdType,
          validIdNumber: data.validIdNumber,
          motherMaidenName: data.motherMaidenName,
          fatherFullName: data.fatherFullName,
        },
        spouse: {
          name: data.spouseName,
          dateOfBirth: data.spouseDateOfBirth,
        },
        dependents,
        income: {
          husbandSource: data.husbandIncomeSource,
          husbandEmployer: data.husbandEmployer,
          wifeSource: data.wifeIncomeSource,
          wifeEmployer: data.wifeEmployer,
        },
        sector: data.sector,
        educationalAttainment: data.educationalAttainment,
        affiliation: {
          organization: data.affiliationOrganization,
          position: data.affiliationPosition,
        },
        crimeDisclosure: {
          accusedOrConvicted: data.accusedOrConvicted === "yes",
          details: data.crimeDetails,
        },
        recommenderName: data.recommenderName,
        agreement: {
          version: agreementVersion,
          accepted: data.agreementAccepted,
          typedName: data.typedName,
        },
        privacyConsent: data.privacyConsent,
        status: "new",
        statusNote: "",
      }, recaptchaToken);

      setSubmittedReference(reference);
      reset(defaultValues);
      setReviewConfirmed(false);
      setStep(0);
    } catch (error) {
      console.error("Unable to submit the membership application.", error);
      setSubmitError(
        "Your application could not be submitted. Check your connection and try again, or download the manual form.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const submitFromReview = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (step < steps.length - 1) { void continueForm(); return; }
    if (!reviewConfirmed || submitting) return;
    void handleSubmit(submitApplication)(event);
  };

  if (submittedReference) {
    return (
      <section className={styles.success} aria-live="polite">
        <CheckCircle2 aria-hidden="true" />
        <p className="eyebrow">Application received</p>
        <h3>Thank you. Your application is ready for manager review.</h3>
        <p>
          Save this reference number: <strong>{submittedReference}</strong>
        </p>
        <p>
          Submission does not guarantee membership approval. TIMGAS MPC may
          contact you for verification, supporting documents, orientation, or a
          handwritten signature.
        </p>
        <button type="button" onClick={() => setSubmittedReference("")}>
          Submit another application
        </button>
      </section>
    );
  }

  return (
    <div className={styles.formShell} ref={formRef} id="online-application">
      <div className={styles.formIntro}>
        <div>
          <p className="eyebrow">Official online application</p>
          <h3>Membership profile and agreement</h3>
          <p>
            Based on the TIMGAS Membership Application Form Revised 2023.
            Fields marked <b>*</b> are required for online submission.
          </p>
        </div>
        <span>
          Step {step + 1} of {steps.length}
        </span>
      </div>

      <ol className={styles.progress} aria-label="Application progress">
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
            <input {...register("website")} tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        {step === 0 && (
          <fieldset>
            <legend>Membership and personal details</legend>
            <p className={styles.sectionHelp}>
              Enter the information requested in the membership-profile page.
              TIMGAS assigns the ID number and approval details internally.
            </p>
            <div className={styles.radioGroup}>
              <span>Type of membership *</span>
              <label>
                <input
                  type="radio"
                  value="associate"
                  {...register("membershipType")}
                />
                Associate
              </label>
              <label>
                <input
                  type="radio"
                  value="regular"
                  {...register("membershipType")}
                />
                Regular
              </label>
            </div>
            <ErrorMessage message={errors.membershipType?.message} />
            <div className={styles.gridTwo}>
              <label>
                Department or group <span>Optional</span>
                <input {...register("departmentName")} maxLength={120} />
              </label>
              <label>
                TIN number <span>Optional</span>
                <input
                  inputMode="numeric"
                  autoComplete="off"
                  pattern="[0-9]*"
                  maxLength={30}
                  {...register("tinNumber", {
                    onChange: (event) => {
                      event.target.value = event.target.value.replace(/\D/g, "");
                    },
                  })}
                />
                <ErrorMessage message={errors.tinNumber?.message} />
              </label>
              <label>
                Date PMES attended <span>Optional</span>
                <input type="date" {...register("pmesDate")} />
              </label>
              <label>
                Gmail address *
                <input type="email" inputMode="email" autoComplete="email" placeholder="applicant@gmail.com" {...register("applicantEmail")} />
                <span>TIMGAS MPC may use this address for application updates.</span>
                <ErrorMessage message={errors.applicantEmail?.message} />
              </label>
            </div>
            <div className={styles.gridThree}>
              <label>
                Family name *
                <input autoComplete="family-name" {...register("familyName")} />
                <ErrorMessage message={errors.familyName?.message} />
              </label>
              <label>
                Given name *
                <input autoComplete="given-name" {...register("givenName")} />
                <ErrorMessage message={errors.givenName?.message} />
              </label>
              <label>
                Middle name <span>Optional</span>
                <input autoComplete="additional-name" {...register("middleName")} />
              </label>
            </div>
            <div className={styles.gridThree}>
              <label>
                Nickname <span>Optional</span>
                <input {...register("nickname")} />
              </label>
              <label>
                Sex *
                <select {...register("sex")}>
                  <option value="">Select</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                </select>
                <ErrorMessage message={errors.sex?.message} />
              </label>
              <label>
                Civil status *
                <select {...register("civilStatus")}>
                  <option value="">Select</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Widowed">Widowed</option>
                  <option value="Separated">Separated</option>
                </select>
                <ErrorMessage message={errors.civilStatus?.message} />
              </label>
            </div>
            <div className={styles.gridTwo}>
              <label>
                Occupation <span>Optional</span>
                <input autoComplete="organization-title" {...register("occupation")} />
              </label>
              <label>
                Date of birth *
                <input type="date" {...register("dateOfBirth")} />
                <ErrorMessage message={errors.dateOfBirth?.message} />
              </label>
              <label>
                Place of birth *
                <input {...register("placeOfBirth")} />
                <ErrorMessage message={errors.placeOfBirth?.message} />
              </label>
              <label>
                Cellphone number *
                <div className={styles.phoneInput}>
                  <span aria-hidden="true">+63</span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    placeholder="9123456789"
                    maxLength={10}
                    aria-label="Cellphone number after +63"
                    {...register("cellphone", {
                      onChange: (event) => {
                        event.target.value = event.target.value
                          .replace(/\D/g, "")
                          .replace(/^0+/, "")
                          .slice(0, 10);
                      },
                    })}
                  />
                </div>
                <span>Enter 10 digits after +63. Do not start with 0.</span>
                <ErrorMessage message={errors.cellphone?.message} />
              </label>
            </div>
            <label>
              Complete address *
              <textarea
                rows={3}
                autoComplete="street-address"
                {...register("address")}
              />
              <ErrorMessage message={errors.address?.message} />
            </label>
            <div className={styles.gridTwo}>
              <label>
                Valid ID type *
                <select {...register("validIdType")}>
                  <option value="">Select a valid ID</option>
                  {philippineValidIdTypes.map((idType) => (
                    <option key={idType} value={idType}>
                      {idType}
                    </option>
                  ))}
                </select>
                <ErrorMessage message={errors.validIdType?.message} />
              </label>
              <label>
                Valid ID number *
                <input
                  inputMode="numeric"
                  autoComplete="off"
                  pattern="[0-9]*"
                  maxLength={80}
                  {...register("validIdNumber", {
                    onChange: (event) => {
                      event.target.value = event.target.value.replace(/\D/g, "");
                    },
                  })}
                />
                <ErrorMessage message={errors.validIdNumber?.message} />
              </label>
            </div>
          </fieldset>
        )}

        {step === 1 && (
          <fieldset>
            <legend>Family and household information</legend>
            <p className={styles.sectionHelp}>
              Complete the fields that apply to you. Optional fields may be
              left blank.
            </p>
            <div className={styles.gridTwo}>
              <label>
                Mother’s maiden name <span>Optional</span>
                <input {...register("motherMaidenName")} />
              </label>
              <label>
                Father’s full name <span>Optional</span>
                <input {...register("fatherFullName")} />
              </label>
              <label>
                Name of spouse <span>Optional</span>
                <input {...register("spouseName")} />
              </label>
              <label>
                Spouse’s date of birth <span>Optional</span>
                <input type="date" {...register("spouseDateOfBirth")} />
              </label>
            </div>

            <div className={styles.subsectionHeading}>
              <div>
                <h4>Dependents</h4>
                <p>Add up to eight dependents, matching the official form.</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  append({ name: "", dateOfBirth: "", age: "", relationship: "" })
                }
                disabled={fields.length >= maximumDependents}
              >
                <Plus /> Add dependent
              </button>
            </div>
            <div className={styles.dependents}>
              {fields.length === 0 ? (
                <p className={styles.emptyRow}>No dependents added.</p>
              ) : (
                fields.map((field, index) => (
                  <div className={styles.dependentRow} key={field.id}>
                    <label>
                      Name
                      <input {...register(`dependents.${index}.name`)} />
                      <ErrorMessage
                        message={errors.dependents?.[index]?.name?.message}
                      />
                    </label>
                    <label>
                      Date of birth
                      <input
                        type="date"
                        {...register(`dependents.${index}.dateOfBirth`)}
                      />
                    </label>
                    <label>
                      Age
                      <input
                        inputMode="numeric"
                        maxLength={3}
                        {...register(`dependents.${index}.age`)}
                      />
                    </label>
                    <label>
                      Relationship
                      <input {...register(`dependents.${index}.relationship`)} />
                    </label>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      aria-label={`Remove dependent ${index + 1}`}
                    >
                      <Trash2 />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className={styles.subsectionHeading}>
              <div>
                <h4>Sources of income</h4>
                <p>Use the husband and wife columns shown in the paper form.</p>
              </div>
            </div>
            <div className={styles.gridTwo}>
              <label>
                Husband — source of income <span>Optional</span>
                <input {...register("husbandIncomeSource")} />
              </label>
              <label>
                Husband — office or agency <span>Optional</span>
                <input {...register("husbandEmployer")} />
              </label>
              <label>
                Wife — source of income <span>Optional</span>
                <input {...register("wifeIncomeSource")} />
              </label>
              <label>
                Wife — office or agency <span>Optional</span>
                <input {...register("wifeEmployer")} />
              </label>
            </div>
          </fieldset>
        )}

        {step === 2 && (
          <fieldset>
            <legend>Background information</legend>
            <div className={styles.radioGroup}>
              <span>Sector *</span>
              {(Object.keys(sectorLabels) as ApplicationFormValues["sector"][]).map(
                (sector) => (
                  <label key={sector}>
                    <input type="radio" value={sector} {...register("sector")} />
                    {sectorLabels[sector]}
                  </label>
                ),
              )}
            </div>
            <ErrorMessage message={errors.sector?.message} />
            <div className={styles.gridTwo}>
              <label>
                Educational attainment <span>Optional</span>
                <input {...register("educationalAttainment")} />
              </label>
              <label>
                Civic, social, or religious affiliation <span>Optional</span>
                <input {...register("affiliationOrganization")} />
              </label>
              <label>
                Position in the organization <span>Optional</span>
                <input {...register("affiliationPosition")} />
              </label>
              <label>
                Membership recommended by <span>Optional</span>
                <input
                  placeholder="Name of an existing member"
                  {...register("recommenderName")}
                />
              </label>
            </div>
            <div className={styles.disclosure}>
              <div className={styles.radioGroup}>
                <span>Have you been accused or convicted of any crime? *</span>
                <label>
                  <input
                    type="radio"
                    value="no"
                    {...register("accusedOrConvicted")}
                  />
                  No
                </label>
                <label>
                  <input
                    type="radio"
                    value="yes"
                    {...register("accusedOrConvicted")}
                  />
                  Yes
                </label>
              </div>
              {values.accusedOrConvicted === "yes" && (
                <label>
                  Please provide details *
                  <textarea
                    rows={4}
                    maxLength={5000}
                    {...register("crimeDetails")}
                  />
                  <span className={styles.characterCount} aria-live="polite">
                    {(values.crimeDetails ?? "").length.toLocaleString()} / 5,000
                    characters
                  </span>
                  <ErrorMessage message={errors.crimeDetails?.message} />
                </label>
              )}
            </div>
          </fieldset>
        )}

        {step === 3 && (
          <fieldset>
            <legend>Membership agreement</legend>
            <div className={styles.agreementNotice}>
              <ShieldCheck aria-hidden="true" />
              <div>
                <h4>Review the official revised 2023 agreement</h4>
                <p>
                  The paper form contains membership fees, capital build-up,
                  savings, share subscription, attendance, and sanctions. Ask
                  TIMGAS MPC to confirm that all amounts and policies are still
                  current before making payment.
                </p>
              </div>
            </div>
            <details className={styles.terms} open>
              <summary>Membership agreement terms</summary>
              <p>
                I agree to become a member of TIMGAS Multipurpose Cooperative,
                take the prescribed Basic Cooperative Course, and support the
                cooperative’s purposes and objectives.
              </p>
              <ul>
                {agreementTerms.map((term) => (
                  <li key={term}>{term}</li>
                ))}
              </ul>
              <p>
                The complete terms—including the amounts stated in the 2023
                form—remain available in the downloadable official document.
              </p>
            </details>
            <label>
              Type your complete name *
              <input
                autoComplete="name"
                placeholder="This records your acknowledgment"
                {...register("typedName")}
              />
              <ErrorMessage message={errors.typedName?.message} />
            </label>
            <label className={styles.checkRow}>
              <input type="checkbox" {...register("agreementAccepted")} />
              <span>
                I have reviewed the membership agreement and agree to comply
                with the cooperative’s governing documents and policies. I
                understand TIMGAS MPC may still require my handwritten
                signature. *
              </span>
            </label>
            <ErrorMessage message={errors.agreementAccepted?.message} />
            <label className={styles.checkRow}>
              <input type="checkbox" {...register("privacyConsent")} />
              <span>
                I consent to TIMGAS MPC collecting and reviewing the personal
                information in this application for membership evaluation and
                verification. *
              </span>
            </label>
            <ErrorMessage message={errors.privacyConsent?.message} />
          </fieldset>
        )}

        {step === 4 && (
          <fieldset>
            <legend>Review and submit</legend>
            <p className={styles.sectionHelp}>
              Check the summary below. Use Previous to correct any information
              before sending it to the TIMGAS manager.
            </p>
            <OfficialMembershipReview data={{
              reference: "Assigned upon submission", dateApplied: "Recorded upon submission", applicantEmail: values.applicantEmail ?? "", membershipType: values.membershipType ?? "associate",
              profile: { departmentName: values.departmentName ?? "", tinNumber: values.tinNumber ?? "", pmesDate: values.pmesDate ?? "", familyName: values.familyName ?? "", givenName: values.givenName ?? "", middleName: values.middleName ?? "", nickname: values.nickname ?? "", sex: values.sex ?? "", civilStatus: values.civilStatus ?? "", occupation: values.occupation ?? "", dateOfBirth: values.dateOfBirth ?? "", placeOfBirth: values.placeOfBirth ?? "", address: values.address ?? "", cellphone: values.cellphone ? `+63${values.cellphone}` : "", validIdType: values.validIdType ?? "", validIdNumber: values.validIdNumber ?? "", motherMaidenName: values.motherMaidenName ?? "", fatherFullName: values.fatherFullName ?? "" },
              spouse: { name: values.spouseName ?? "", dateOfBirth: values.spouseDateOfBirth ?? "" }, dependents: (values.dependents ?? []).map((dependent) => ({ name: dependent.name ?? "", dateOfBirth: dependent.dateOfBirth ?? "", age: dependent.age ?? "", relationship: dependent.relationship ?? "" })), income: { husbandSource: values.husbandIncomeSource ?? "", husbandEmployer: values.husbandEmployer ?? "", wifeSource: values.wifeIncomeSource ?? "", wifeEmployer: values.wifeEmployer ?? "" }, sector: values.sector ?? "arb", educationalAttainment: values.educationalAttainment ?? "", affiliation: { organization: values.affiliationOrganization ?? "", position: values.affiliationPosition ?? "" }, crimeDisclosure: { accusedOrConvicted: values.accusedOrConvicted === "yes", details: values.crimeDetails ?? "" }, recommenderName: values.recommenderName ?? "", typedName: values.typedName ?? "" }} />
            <div className={styles.finalNotice}>
              <ShieldCheck aria-hidden="true" />
              <p>
                Your application is private. Visitors cannot read submissions;
                only an authorized TIMGAS manager can review them through the
                protected dashboard.
              </p>
            </div>
            <label className={`${styles.checkRow} ${styles.reviewConfirmation}`}><input type="checkbox" checked={reviewConfirmed} onChange={(event) => setReviewConfirmed(event.target.checked)} /><span>I have reviewed the Membership Profile and Membership Agreement above and I am ready to submit. *</span></label>
          </fieldset>
        )}

        {submitError && (
          <p className={styles.submitError} role="alert">
            {submitError}
          </p>
        )}

        <div className={styles.formActions}>
          {step > 0 && (
            <button type="button" onClick={() => moveToStep(step - 1)}>
              <ArrowLeft /> Previous
            </button>
          )}
          {step < steps.length - 1 ? (
            <button
              type="button"
              disabled={step === 3 && !stepFourConsentsAccepted}
              onClick={() => void continueForm()}
            >
              Continue <ArrowRight />
            </button>
          ) : (
            <button type="submit" disabled={submitting || !reviewConfirmed}>
              <Send /> {submitting ? "Submitting…" : "Submit application"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
