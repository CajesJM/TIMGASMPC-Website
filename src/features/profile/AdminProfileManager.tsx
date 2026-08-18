import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { Save, UserRound } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { auth } from '../../lib/firebase';
import { db } from '../../lib/firestore';
import styles from './AdminProfileManager.module.css';

export type ManagerIdentity = {
  fullName: string;
  position: string;
};

type AdminProfileManagerProps = {
  onProfileChange: (profile: ManagerIdentity) => void;
};

export function AdminProfileManager({ onProfileChange }: AdminProfileManagerProps) {
  const user = auth?.currentUser;
  const [fullName, setFullName] = useState(user?.displayName ?? '');
  const [position, setPosition] = useState('Administrator');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(Boolean(db && user));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(db && user ? '' : 'Manager profile is unavailable.');

  useEffect(() => {
    if (!db || !user) return;
    const firestore = db;
    let active = true;

    void getDoc(doc(firestore, 'adminProfiles', user.uid))
      .then((snapshot) => {
        if (!active) return;
        const data = snapshot.data();
        const nextName = typeof data?.fullName === 'string' && data.fullName.trim()
          ? data.fullName
          : user.displayName ?? '';
        const nextPosition = typeof data?.position === 'string' && data.position.trim()
          ? data.position
          : 'Administrator';
        setFullName(nextName);
        setPosition(nextPosition);
        setPhone(typeof data?.phone === 'string' ? data.phone : '');
        onProfileChange({ fullName: nextName, position: nextPosition });
      })
      .catch((profileError) => {
        console.error('Unable to load the manager profile.', profileError);
        if (active) setError('The manager profile could not be loaded.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [onProfileChange, user]);

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!db || !user) return;
    const nextName = fullName.trim();
    const nextPosition = position.trim();
    if (!nextName || !nextPosition) return setError('Name and position are required.');

    setSaving(true);
    setMessage('');
    setError('');
    try {
      await Promise.all([
        setDoc(doc(db, 'adminProfiles', user.uid), {
          fullName: nextName,
          position: nextPosition,
          phone: phone.trim(),
          email: user.email ?? '',
          updatedAt: serverTimestamp(),
        }, { merge: true }),
        updateProfile(user, { displayName: nextName }),
      ]);
      setFullName(nextName);
      setPosition(nextPosition);
      setPhone(phone.trim());
      onProfileChange({ fullName: nextName, position: nextPosition });
      setMessage('Profile updated successfully.');
    } catch (saveError) {
      console.error('Unable to save the manager profile.', saveError);
      setError('The profile could not be saved. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className={styles.manager} id="profile" aria-labelledby="profile-heading">
      <div className={styles.heading}>
        <div><p className="eyebrow">Manager account</p><h2 id="profile-heading">Personal profile</h2><p>Keep the manager information shown inside this secure dashboard up to date.</p></div>
        <span aria-hidden="true"><UserRound /></span>
      </div>
      <form className={styles.form} onSubmit={saveProfile} aria-busy={loading || saving}>
        <div className={styles.fields}>
          <label>Full name<input value={fullName} onChange={(event) => setFullName(event.target.value)} minLength={2} maxLength={100} autoComplete="name" disabled={loading} required /></label>
          <label>Position<input value={position} onChange={(event) => setPosition(event.target.value)} minLength={2} maxLength={80} placeholder="Administrator" disabled={loading} required /></label>
          <label>Contact number <span>(optional)</span><input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} maxLength={30} autoComplete="tel" placeholder="Enter contact number" disabled={loading} /></label>
          <label>Email address <span>(sign-in account)</span><input type="email" value={user?.email ?? ''} disabled readOnly /></label>
        </div>
        <p className={styles.note}>The email address is managed through Firebase Authentication and cannot be changed from this form.</p>
        {error && <p className={styles.error} role="alert">{error}</p>}
        {message && <p className={styles.success} role="status">{message}</p>}
        <button className={styles.submit} type="submit" disabled={loading || saving}><Save /> {saving ? 'Saving…' : 'Save profile'}</button>
      </form>
    </section>
  );
}
