import {
  Timestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";

export const applicationStatuses = [
  "new",
  "in_review",
  "for_verification",
  "approved",
] as const;

export type ApplicationStatus = (typeof applicationStatuses)[number];
export type MembershipType = "associate" | "regular";

export const applicationStatusLabels: Record<ApplicationStatus, string> = {
  new: "New",
  in_review: "In review",
  for_verification: "For verification",
  approved: "Approved",
};

export const membershipTypeLabels: Record<MembershipType, string> = {
  associate: "Associate",
  regular: "Regular",
};

export type ApplicationDependent = {
  name: string;
  dateOfBirth: string;
  age: string;
  relationship: string;
};

export type MembershipApplication = {
  id: string;
  reference: string;
  applicantName: string;
  applicationType: MembershipType;
  profile: {
    departmentName: string;
    tinNumber: string;
    pmesDate: string;
    familyName: string;
    givenName: string;
    middleName: string;
    nickname: string;
    sex: string;
    civilStatus: string;
    occupation: string;
    dateOfBirth: string;
    placeOfBirth: string;
    address: string;
    cellphone: string;
    validIdType: string;
    validIdNumber: string;
    motherMaidenName: string;
    fatherFullName: string;
  };
  spouse: {
    name: string;
    dateOfBirth: string;
  };
  dependents: ApplicationDependent[];
  income: {
    husbandSource: string;
    husbandEmployer: string;
    wifeSource: string;
    wifeEmployer: string;
  };
  sector: string;
  educationalAttainment: string;
  affiliation: {
    organization: string;
    position: string;
  };
  crimeDisclosure: {
    accusedOrConvicted: boolean;
    details: string;
  };
  recommenderName: string;
  agreement: {
    version: string;
    accepted: boolean;
    typedName: string;
  };
  privacyConsent: boolean;
  status: ApplicationStatus;
  statusNote: string;
  submittedAt: Timestamp | null;
  updatedAt: Timestamp | null;
};

export function isApplicationStatus(value: unknown): value is ApplicationStatus {
  return applicationStatuses.includes(value as ApplicationStatus);
}

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function parseMembershipApplication(
  snapshot: QueryDocumentSnapshot<DocumentData>,
): MembershipApplication {
  const data = snapshot.data();
  const profile = record(data.profile);
  const spouse = record(data.spouse);
  const income = record(data.income);
  const affiliation = record(data.affiliation);
  const crimeDisclosure = record(data.crimeDisclosure);
  const agreement = record(data.agreement);
  const applicationType: MembershipType =
    data.applicationType === "associate" ? "associate" : "regular";

  return {
    id: snapshot.id,
    reference: text(data.reference) || snapshot.id,
    applicantName: text(data.applicantName) || "Name unavailable",
    applicationType,
    profile: {
      departmentName: text(profile.departmentName),
      tinNumber: text(profile.tinNumber),
      pmesDate: text(profile.pmesDate),
      familyName: text(profile.familyName),
      givenName: text(profile.givenName),
      middleName: text(profile.middleName),
      nickname: text(profile.nickname),
      sex: text(profile.sex),
      civilStatus: text(profile.civilStatus),
      occupation: text(profile.occupation),
      dateOfBirth: text(profile.dateOfBirth),
      placeOfBirth: text(profile.placeOfBirth),
      address: text(profile.address),
      cellphone: text(profile.cellphone),
      validIdType: text(profile.validIdType),
      validIdNumber: text(profile.validIdNumber),
      motherMaidenName: text(profile.motherMaidenName),
      fatherFullName: text(profile.fatherFullName),
    },
    spouse: {
      name: text(spouse.name),
      dateOfBirth: text(spouse.dateOfBirth),
    },
    dependents: Array.isArray(data.dependents)
      ? data.dependents.slice(0, 8).map((item) => {
          const dependent = record(item);
          return {
            name: text(dependent.name),
            dateOfBirth: text(dependent.dateOfBirth),
            age: text(dependent.age),
            relationship: text(dependent.relationship),
          };
        })
      : [],
    income: {
      husbandSource: text(income.husbandSource),
      husbandEmployer: text(income.husbandEmployer),
      wifeSource: text(income.wifeSource),
      wifeEmployer: text(income.wifeEmployer),
    },
    sector: text(data.sector),
    educationalAttainment: text(data.educationalAttainment),
    affiliation: {
      organization: text(affiliation.organization),
      position: text(affiliation.position),
    },
    crimeDisclosure: {
      accusedOrConvicted: crimeDisclosure.accusedOrConvicted === true,
      details: text(crimeDisclosure.details),
    },
    recommenderName: text(data.recommenderName),
    agreement: {
      version: text(agreement.version),
      accepted: agreement.accepted === true,
      typedName: text(agreement.typedName),
    },
    privacyConsent: data.privacyConsent === true,
    status: isApplicationStatus(data.status) ? data.status : "new",
    statusNote: text(data.statusNote),
    submittedAt:
      data.submittedAt instanceof Timestamp ? data.submittedAt : null,
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt : null,
  };
}

export function formatApplicationDate(value: Timestamp | null) {
  if (!value) return "Date unavailable";
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value.toDate());
}
