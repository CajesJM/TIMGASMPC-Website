import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Eye, EyeOff, LockKeyhole, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '../../components/Button/Button';
import styles from './LoginPage.module.css';

const schema = z.object({ email: z.string().email('Enter a valid email'), password: z.string().min(8, 'Password must be at least 8 characters') });
type LoginValues = z.infer<typeof schema>;

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginValues>({ resolver: zodResolver(schema) });
  const login = async () => { await new Promise(resolve => setTimeout(resolve, 350)); navigate('/manager/preview'); };
  return <section className={styles.page}><div className={styles.panel}><Link to="/" className={styles.back}><ArrowLeft size={17} /> Back to website</Link><div className={styles.icon}><LockKeyhole /></div><p className="eyebrow">Authorized access only</p><h1>Manager sign in</h1><p>Manage applications, website content, and cooperative announcements.</p><div className={styles.notice}><ShieldCheck size={18} /><span>Frontend preview: any valid email and 8-character password opens the dashboard preview. Firebase administrator claims will enforce access later.</span></div><form onSubmit={handleSubmit(login)} noValidate><label htmlFor="email">Email address</label><input id="email" type="email" autoComplete="username" {...register('email')} />{errors.email && <small>{errors.email.message}</small>}<label htmlFor="password">Password</label><div className={styles.password}><input id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" {...register('password')} /><button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff /> : <Eye />}</button></div>{errors.password && <small>{errors.password.message}</small>}<Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Signing in…' : 'Sign in securely'}</Button><a href="#reset" onClick={event => event.preventDefault()}>Forgot your password?</a></form></div></section>;
}
