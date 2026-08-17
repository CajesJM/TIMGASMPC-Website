import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, FileText, Info, ShieldCheck, Upload } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../../components/Button/Button';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import styles from './ApplicationPage.module.css';

const applicationSchema = z.object({
  applicationType: z.enum(['Membership', 'Farm assistance', 'Loan inquiry']),
  firstName: z.string().trim().min(2, 'Enter your first name'),
  lastName: z.string().trim().min(2, 'Enter your last name'),
  email: z.string().trim().email('Enter a valid email address').or(z.literal('')),
  phone: z.string().trim().regex(/^(\+63|0)9\d{9}$/, 'Use a valid Philippine mobile number'),
  address: z.string().trim().min(10, 'Enter your complete address'),
  occupation: z.string().trim().min(2, 'Enter your occupation or livelihood'),
  message: z.string().trim().max(500, 'Keep your message under 500 characters').optional(),
  consent: z.literal(true, { error: 'You must confirm before continuing' }),
});

type ApplicationValues = z.infer<typeof applicationSchema>;

export function ApplicationPage() {
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ApplicationValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: { applicationType: 'Membership', email: '', consent: undefined },
  });

  const onSubmit = async () => { await new Promise(resolve => setTimeout(resolve, 450)); setSubmitted(true); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  if (submitted) return <section className={styles.success}><div><CheckCircle2 size={54} /><p className="eyebrow">Demo submission complete</p><h1>Your form is ready for the backend.</h1><p>No personal information was stored or sent. When Firebase is connected, this screen will show the secure application reference number returned by the Cloud Function.</p><Button type="button" onClick={() => setSubmitted(false)}>Review another application</Button></div></section>;

  return <>
    <PageHeader eyebrow="Online application" title="Take the first step toward membership." description="Complete the form below and our cooperative team will review your information. You do not need an account to apply." />
    <section className="section"><div className={`container ${styles.layout}`}>
      <aside><div className={styles.guide}><FileText /><h2>Before you begin</h2><ol><li>Prepare one valid government-issued ID.</li><li>Provide a reachable mobile number.</li><li>Review all details before submitting.</li></ol></div><div className={styles.privacy}><ShieldCheck /><div><strong>Your documents stay private.</strong><p>Files will be stored securely and visible only to the authorized TIMGAS manager.</p></div></div></aside>
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className={styles.demoNotice}><Info size={18} /><p><strong>Frontend preview:</strong> this form validates locally but will not store or transmit your information until the Firebase backend is connected.</p></div>
        <fieldset><legend>Application details</legend><div className={styles.fieldFull}><label htmlFor="applicationType">What are you applying for?</label><select id="applicationType" {...register('applicationType')}><option>Membership</option><option>Farm assistance</option><option>Loan inquiry</option></select></div></fieldset>
        <fieldset><legend>Personal information</legend><div className={styles.fields}><Field label="First name" id="firstName" error={errors.firstName?.message}><input id="firstName" autoComplete="given-name" {...register('firstName')} /></Field><Field label="Last name" id="lastName" error={errors.lastName?.message}><input id="lastName" autoComplete="family-name" {...register('lastName')} /></Field><Field label="Email address (optional)" id="email" error={errors.email?.message}><input id="email" type="email" autoComplete="email" {...register('email')} /></Field><Field label="Mobile number" id="phone" hint="Example: 09171234567" error={errors.phone?.message}><input id="phone" type="tel" autoComplete="tel" {...register('phone')} /></Field><Field label="Complete home address" id="address" error={errors.address?.message} full><textarea id="address" rows={3} autoComplete="street-address" {...register('address')} /></Field><Field label="Occupation or livelihood" id="occupation" error={errors.occupation?.message} full><input id="occupation" {...register('occupation')} /></Field></div></fieldset>
        <fieldset><legend>Supporting information</legend><Field label="Message (optional)" id="message" hint="Tell us anything that may help us review your application." error={errors.message?.message} full><textarea id="message" rows={4} {...register('message')} /></Field><div className={styles.upload}><Upload /><div><strong>Document upload</strong><span>PDF, JPG, JPEG, or PNG · Maximum size will be set by the manager</span></div><button type="button" disabled>Available after backend setup</button></div></fieldset>
        <label className={styles.consent}><input type="checkbox" {...register('consent')} /><span>I confirm that the information provided is accurate and I agree to its use for processing this application.</span></label>{errors.consent && <p className={styles.error}>{errors.consent.message}</p>}
        <div className={styles.submit}><Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Checking application…' : 'Submit application'}</Button><p>Submitting this form does not automatically guarantee approval.</p></div>
      </form>
    </div></section>
  </>;
}

type FieldProps = { label: string; id: string; hint?: string; error?: string; full?: boolean; children: React.ReactNode };
function Field({ label, id, hint, error, full, children }: FieldProps) { return <div className={`${styles.field} ${full ? styles.fieldFull : ''}`}><label htmlFor={id}>{label}</label>{children}{hint && !error && <small>{hint}</small>}{error && <small className={styles.error}>{error}</small>}</div>; }
