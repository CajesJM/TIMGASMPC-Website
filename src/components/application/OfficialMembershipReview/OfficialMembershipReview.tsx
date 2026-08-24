import type { MembershipType } from "../../../features/applications/applicationTypes";
import styles from "./OfficialMembershipReview.module.css";

export type OfficialMembershipReviewData = {
  reference: string;
  dateApplied: string;
  applicantEmail: string;
  membershipType: MembershipType;
  profile: { departmentName: string; tinNumber: string; pmesDate: string; familyName: string; givenName: string; middleName: string; nickname: string; sex: string; civilStatus: string; occupation: string; dateOfBirth: string; placeOfBirth: string; address: string; cellphone: string; validIdType: string; validIdNumber: string; motherMaidenName: string; fatherFullName: string; };
  spouse: { name: string; dateOfBirth: string };
  dependents: { name: string; dateOfBirth: string; age: string; relationship: string }[];
  income: { husbandSource: string; husbandEmployer: string; wifeSource: string; wifeEmployer: string };
  sector: string;
  educationalAttainment: string;
  affiliation: { organization: string; position: string };
  crimeDisclosure: { accusedOrConvicted: boolean; details: string };
  recommenderName: string;
  typedName: string;
};

const documentValue = (text: string) => text || "\u00a0";
const profileRows = 8;

function Line({ value, className = "" }: { value: string; className?: string }) {
  return <span className={`${styles.line} ${className}`}>{documentValue(value)}</span>;
}

function FormField({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return <span className={`${styles.formField} ${className}`}><b>{label}</b><Line value={value} /></span>;
}

function DocumentHeader({ title, place }: { title: string; place: string }) {
  return <header className={styles.documentHeader}><p>TIMGAS MULTIPURPOSE COOPERATIVE</p><small>{place}</small><h3>{title}</h3></header>;
}

function MembershipProfile({ data }: { data: OfficialMembershipReviewData }) {
  const { profile } = data;
  const dependents = Array.from({ length: profileRows }, (_, index) => data.dependents[index] ?? { name: "", dateOfBirth: "", age: "", relationship: "" });
  return <article className={`${styles.page} ${styles.profilePage}`} aria-label="Membership profile">
    <DocumentHeader title="MEMBERSHIP PROFILE" place="Trinidad, Bohol" />
    <div className={styles.idRow}><FormField label="ID No." value="Assigned by TIMGAS" /><FormField label="Date Applied" value={data.dateApplied} /></div>
    <div className={styles.idRow}><FormField label="TIN No." value={profile.tinNumber} /><FormField label="Date PMES Attended:" value={profile.pmesDate} /></div>
    <p className={styles.department}><b>Name of Department:</b><Line value={profile.departmentName} /></p>
    <p className={styles.membershipType}><b>Type of Membership:</b><span>{data.membershipType === "associate" ? "☑" : "☐"} Associates</span><span>{data.membershipType === "regular" ? "☑" : "☐"} Regular</span></p>
    <p className={styles.nameLine}><b>Name</b><span><Line value={profile.familyName} /><small>(Family Name)</small></span><span><Line value={profile.givenName} /><small>(Given Name)</small></span><span><Line value={profile.middleName} /><small>(Middle Name)</small></span></p>
    <div className={styles.shortFields}><FormField label="Nickname" value={profile.nickname} /><FormField label="Sex" value={profile.sex} /><FormField label="Civil Status" value={profile.civilStatus} /></div>
    <div className={styles.identityFields}><FormField label="Occupation" value={profile.occupation} /><FormField label="Date of Birth" value={profile.dateOfBirth} /><FormField label="Place of Birth" value={profile.placeOfBirth} /></div>
    <p className={styles.fullField}><b>Address</b><Line value={profile.address} /></p>
    <div className={styles.contactRow}><FormField label="Cellphone No." value={profile.cellphone} /><FormField label="Gmail address" value={data.applicantEmail} /></div>
    <div className={styles.idDetails}><FormField label="Valid ID:" value={profile.validIdType} /><FormField label="ID Number:" value={profile.validIdNumber} /></div>
    <p className={styles.fullField}><b>Mother’s Maiden Name:</b><Line value={profile.motherMaidenName} /></p>
    <p className={styles.fullField}><b>Father’s Full Name:</b><Line value={profile.fatherFullName} /></p>
    <div className={styles.spouseRow}><FormField label="Name of Spouse" value={data.spouse.name} /><FormField label="B-date of Spouse" value={data.spouse.dateOfBirth} /></div>
    <h4>Name of Dependents</h4>
    <table className={styles.dependentsTable}><thead><tr><th>Name of Dependents</th><th>Date of Birth</th><th>Age</th><th>Relationship</th></tr></thead><tbody>{dependents.map((dependent, index) => <tr key={`${dependent.name}-${index}`}><td>{documentValue(dependent.name)}</td><td>{documentValue(dependent.dateOfBirth)}</td><td>{documentValue(dependent.age)}</td><td>{documentValue(dependent.relationship)}</td></tr>)}</tbody></table>
    <h4>Sources of Income:</h4>
    <table className={styles.incomeTable}><thead><tr><th colSpan={2}>Husband</th><th colSpan={2}>Wife</th></tr><tr><th>Sources of Income</th><th>If Employed, Office / Agency</th><th>Sources of Income</th><th>If Employed, Office / Agency</th></tr></thead><tbody><tr><td>{documentValue(data.income.husbandSource)}</td><td>{documentValue(data.income.husbandEmployer)}</td><td>{documentValue(data.income.wifeSource)}</td><td>{documentValue(data.income.wifeEmployer)}</td></tr></tbody></table>
    <p className={styles.sector}><b>SECTOR *:</b><span>{data.sector === "arb" ? "☑" : "☐"} ARB</span><span>{data.sector === "arb_household" ? "☑" : "☐"} ARB Household</span><span>{data.sector === "non_arb" ? "☑" : "☐"} Non-ARB</span><span>{data.sector === "rural_women" ? "☑" : "☐"} Rural Women</span></p>
    <p className={styles.fullField}><b>Educational Attainment:</b><Line value={data.educationalAttainment} /></p>
    <div className={styles.affiliationRow}><FormField label="Civic, Social, and Religious Affiliation" value={data.affiliation.organization} /><FormField label="Position" value={data.affiliation.position} /></div>
    <p className={styles.crimeRow}><b>Have you been accused or convicted of any crime?</b><Line value={data.crimeDisclosure.accusedOrConvicted ? "Yes" : "No"} /><b>If affirmative, please amplify:</b><Line value={data.crimeDisclosure.details} /></p>
    <div className={styles.recommendation}><span><b>Membership Recommended by:</b><Line value={data.recommenderName} /><small>(Name of Existing Member)</small></span><span><Line value={data.typedName} /><b>Signature over printed name</b></span></div>
    <section className={styles.bodApproval}><b>FOR BOD APPROVAL: <small>(During BOD Meeting)</small></b><div><FormField label="Date Approved:" value="" /><FormField label="Board Resolution No." value="" /></div><span className={styles.secretary}><Line value="" /><b>Secretary</b></span></section>
  </article>;
}

function MembershipAgreement({ data }: { data: OfficialMembershipReviewData }) {
  const applicantName = data.typedName || [data.profile.givenName, data.profile.middleName, data.profile.familyName].filter(Boolean).join(" ");
  return <article className={`${styles.page} ${styles.agreementPage}`} aria-label="Membership agreement">
    <DocumentHeader title="MEMBERSHIP AGREEMENT" place="Poblacion, Trinidad, Bohol" />
    <p className={styles.agreementDate}><b>Date</b><Line value={data.dateApplied} /></p>
    <p>The Board of Directors<br />TIMGAS Multipurpose Cooperative<br />Poblacion, Trinidad, Bohol</p>
    <p className={styles.agreementLead}>I, <Line value={applicantName} />, a resident of <Line value={data.profile.address} />, Bohol, <b>HEREBY AGREE TO BE A MEMBER OF THE TIMGAS MULTIPURPOSE COOPERATIVE</b>, Poblacion, Trinidad, Bohol. I will take the training <b>“Basic Cooperative Course”</b> as prescribed for the prospective members and I understand the purposes and objectives of this cooperative.</p>
    <h4>Terms and Conditions:</h4>
    <ol className={styles.terms}>
      <li>To comply with the provisions of the Articles of Cooperation and By-Laws and Policies set by the Board of Directors, the General Assembly as well as the acts of the duly constituted authorities, and failure to do so on my part, the cooperative at its option may impose on me any of the following:<ol type="a"><li>Fines</li><li>Suspension</li><li>Expulsion from membership whereupon all my shareholdings shall be answerable for all my liabilities to the cooperative.</li></ol></li>
      <li>To participate in the capital build-up and savings mobilization of the cooperative by:<ol type="a"><li><b>General Membership:</b> Paying Five Hundred Pesos (500.00) for the initial CBU-200.00, initial savings-200.00, and Membership fee of 100.00 upon the submission of my membership and upon the approval of the Board of Directors with my application of membership.</li><li>Paying at least the value of Twenty-five (25) Shares with a par value of Two Thousand Five Hundred Pesos (PhP2,500.00) for member regularization. It may be paid by lump sum or on an installment basis within 1 year.</li><li>Subscribing of One Subscription is equal to One hundred (100) Shares with a par value of Ten Thousand Pesos (Php 10,000.00) and paying them each either in lump-sum or in regular installments for not more than a period of two (2) years.</li><li>Paying CBU of at least 10% of the Loan amount upon release.</li><li>Agreeing with the retention of CBU and Savings upon the next release of my loan application.</li><li>Applicable for Groupings (Weekly) only: By paying CBU-25.00 &amp; Savings-25.00 per week together with the payment of my loans and insurance.</li><li>Paying at least 100.00 per month with a total of 1,200.00 per year for my share capital.</li><li>Paying the remaining balance of my subscribed shares on a lump-sum or installment basis.</li><li>For Members Fully Subscribed for Share Capital Subscription: Agreeing on the retention of at least Twenty Percent (20%) of the interest (dividends) on share capital and patronage refund due to me in addition to my share capital.</li><li>For Members Share below the Subscription: Agreeing on the retention of at least Eighty Percent (80%) of the interest (dividends) on share capital and patronage refund due to me in compliance with the directives of duly constituted authorities as well as the decisions of the Board of Directors regarding the operating policies of the cooperative.</li><li><b>Regular Membership:</b> Fill-up the Regularization Form.</li><li><b>Resignation of Membership:</b> Fill-up a resignation form and wait for 60 days for Board of Director’s Approval.</li></ol></li>
      <li>To attend all meetings, conferences, and seminars as required by the Board of Directors, and failure to do so unless previously excused by the Board of Directors, may subject me to any penalty that may be imposed as provided in the Membership Policies and By-Laws.</li>
    </ol>
    <p>The provisions of this agreement, Articles of Cooperation, and By-Laws have been explained to me. I understand them and agree to abide by all of them.</p><p>In all of the above undertakings, I am aware that the Board of Directors and the Cooperative may impose sanctions against me or perform any acts necessary to make the sanctions effective.</p><p>I have hereunto set my signature this <Line value="" /> day of <Line value="" />, 20<Line value="" />.</p>
    <div className={styles.signature}><Line value={applicantName} /><b>Name and Signature of Applicant</b></div>
  </article>;
}

export function OfficialMembershipReview({ data }: { data: OfficialMembershipReviewData }) {
  return <div className={styles.viewport} aria-label="Official membership application preview"><MembershipProfile data={data} /><MembershipAgreement data={data} /></div>;
}
