import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { Camera, Pencil, Save, Trash2, UserRound, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { auth } from '../../lib/firebase';
import { db } from '../../lib/firestore';
import { deleteStorageFile, storage } from '../../lib/storage';
import type { ShowToast } from '../notifications/toastTypes';
import styles from './AdminProfileManager.module.css';

export type ManagerIdentity = {
  fullName: string;
  position: string;
  avatarUrl: string;
};

type AdminProfileManagerProps = {
  onProfileChange: (profile: ManagerIdentity) => void;
  showToast: ShowToast;
};

const maximumAvatarSize = 2 * 1024 * 1024;
const acceptedAvatarTypes = ['image/jpeg', 'image/png', 'image/webp'];

function safeFileName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9.-]+/g, '-').replace(/^-+|-+$/g, '');
}

export function AdminProfileManager({ onProfileChange, showToast }: AdminProfileManagerProps) {
  const user = auth?.currentUser;
  const [fullName, setFullName] = useState(user?.displayName ?? '');
  const [position, setPosition] = useState('Administrator');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [existingAvatarUrl, setExistingAvatarUrl] = useState(user?.photoURL ?? '');
  const [existingAvatarPath, setExistingAvatarPath] = useState('');
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [savedProfile, setSavedProfile] = useState({
    fullName: user?.displayName ?? '',
    position: 'Administrator',
    phone: '',
    avatarUrl: user?.photoURL ?? '',
    avatarPath: '',
  });
  const [loading, setLoading] = useState(Boolean(db && user));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(db && user ? '' : 'Manager profile is unavailable.');
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const avatarPreview = useMemo(() => avatar ? URL.createObjectURL(avatar) : '', [avatar]);

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
        const nextPhone = typeof data?.phone === 'string' ? data.phone : '';
        const nextAvatarPath = typeof data?.avatarPath === 'string' ? data.avatarPath : '';
        setPhone(nextPhone);
        const nextAvatarUrl = typeof data?.avatarUrl === 'string' ? data.avatarUrl : user.photoURL ?? '';
        setExistingAvatarUrl(nextAvatarUrl);
        setExistingAvatarPath(nextAvatarPath);
        setSavedProfile({ fullName: nextName, position: nextPosition, phone: nextPhone, avatarUrl: nextAvatarUrl, avatarPath: nextAvatarPath });
        onProfileChange({ fullName: nextName, position: nextPosition, avatarUrl: nextAvatarUrl });
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

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const selectAvatar = (event: ChangeEvent<HTMLInputElement>) => {
    if (!isEditing) return;
    const selectedAvatar = event.target.files?.[0] ?? null;
    if (!selectedAvatar) return;
    if (!acceptedAvatarTypes.includes(selectedAvatar.type)) {
      event.target.value = '';
      return setError('Use a JPEG, PNG, or WebP profile photo.');
    }
    if (selectedAvatar.size > maximumAvatarSize) {
      event.target.value = '';
      return setError('The profile photo must be smaller than 2 MB.');
    }
    setError('');
    setAvatar(selectedAvatar);
    setRemoveAvatar(false);
  };

  const toggleEditing = () => {
    if (isEditing) {
      setFullName(savedProfile.fullName);
      setPosition(savedProfile.position);
      setPhone(savedProfile.phone);
      setExistingAvatarUrl(savedProfile.avatarUrl);
      setExistingAvatarPath(savedProfile.avatarPath);
      setAvatar(null);
      setRemoveAvatar(false);
      setError('');
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
    setIsEditing((current) => !current);
  };

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!db || !user || !isEditing) return;
    const nextName = fullName.trim();
    const nextPosition = position.trim();
    if (!nextName || !nextPosition) return setError('Name and position are required.');

    setSaving(true);
    setError('');
    let uploadedAvatarPath = '';
    try {
      let nextAvatarUrl = removeAvatar ? '' : existingAvatarUrl;
      let nextAvatarPath = removeAvatar ? '' : existingAvatarPath;

      if (avatar) {
        if (!storage) throw new Error('Firebase Storage is not configured.');
        uploadedAvatarPath = `profiles/${user.uid}/${Date.now()}-${safeFileName(avatar.name)}`;
        const avatarReference = ref(storage, uploadedAvatarPath);
        await uploadBytes(avatarReference, avatar, { contentType: avatar.type });
        nextAvatarUrl = await getDownloadURL(avatarReference);
        nextAvatarPath = uploadedAvatarPath;
      }

      await setDoc(doc(db, 'adminProfiles', user.uid), {
        fullName: nextName,
        position: nextPosition,
        phone: phone.trim(),
        email: user.email ?? '',
        avatarUrl: nextAvatarUrl,
        avatarPath: nextAvatarPath,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      try {
        await updateProfile(user, { displayName: nextName, photoURL: nextAvatarUrl || null });
      } catch (authProfileError) {
        console.error('Firebase Authentication profile synchronization failed.', authProfileError);
      }

      let oldAvatarCleanupFailed = false;
      const previousAvatarLocation = existingAvatarPath || existingAvatarUrl;
      const nextAvatarLocation = nextAvatarPath || nextAvatarUrl;
      if ((removeAvatar || uploadedAvatarPath) && previousAvatarLocation && previousAvatarLocation !== nextAvatarLocation) {
        try {
          await deleteStorageFile(existingAvatarPath, existingAvatarUrl);
        } catch (cleanupError) {
          oldAvatarCleanupFailed = true;
          console.error('The previous profile photo could not be removed from Storage.', cleanupError);
        }
      }

      setFullName(nextName);
      setPosition(nextPosition);
      setPhone(phone.trim());
      setAvatar(null);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
      setRemoveAvatar(false);
      setExistingAvatarUrl(nextAvatarUrl);
      setExistingAvatarPath(nextAvatarPath);
      setSavedProfile({ fullName: nextName, position: nextPosition, phone: phone.trim(), avatarUrl: nextAvatarUrl, avatarPath: nextAvatarPath });
      setIsEditing(false);
      onProfileChange({ fullName: nextName, position: nextPosition, avatarUrl: nextAvatarUrl });
      showToast(
        oldAvatarCleanupFailed
          ? 'Profile updated, but the previous photo could not be removed from Storage.'
          : 'Profile updated successfully.',
        oldAvatarCleanupFailed ? 'warning' : 'success',
      );
    } catch (saveError) {
      console.error('Unable to save the manager profile.', saveError);
      if (uploadedAvatarPath) await deleteStorageFile(uploadedAvatarPath).catch(() => undefined);
      const failureMessage = 'The profile could not be saved. Please try again.';
      setError(failureMessage);
      showToast(failureMessage, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className={styles.manager} id="profile" aria-labelledby="profile-heading">
      <div className={styles.heading}>
        <div><p className="eyebrow">Manager account</p><h2 id="profile-heading">Personal profile</h2><p>Keep the manager information shown inside this secure dashboard up to date.</p></div>
        <button className={`${styles.editToggle} ${isEditing ? styles.editToggleActive : ''}`} type="button" onClick={toggleEditing} aria-pressed={isEditing} disabled={loading || saving}>
          <Pencil aria-hidden="true" /><span>{isEditing ? 'Editing' : 'Edit profile'}</span><i aria-hidden="true"><b /></i>
        </button>
      </div>
      <form className={`${styles.form} ${!isEditing ? styles.formLocked : ''}`} onSubmit={saveProfile} aria-busy={loading || saving}>
        <div className={styles.avatarEditor}>
          <div className={styles.avatarPreview}>
            {avatarPreview || (!removeAvatar && existingAvatarUrl)
              ? <img src={avatarPreview || existingAvatarUrl} alt="Manager profile preview" />
              : <UserRound aria-hidden="true" />}
          </div>
          <div className={styles.avatarActions}>
            <div><strong>Profile photo</strong><p>Use a square JPEG, PNG, or WebP image under 2 MB.</p></div>
            <div className={styles.avatarButtons}>
              <label className={styles.photoButton} aria-disabled={!isEditing}><Camera /> {existingAvatarUrl || avatar ? 'Change photo' : 'Add photo'}<input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={selectAvatar} disabled={loading || saving || !isEditing} /></label>
              {avatar && <button type="button" className={styles.removeButton} disabled={!isEditing} onClick={() => { setAvatar(null); if (avatarInputRef.current) avatarInputRef.current.value = ''; }}><X /> Cancel new photo</button>}
              {!avatar && existingAvatarUrl && !removeAvatar && <button type="button" className={styles.removeButton} disabled={!isEditing} onClick={() => setRemoveAvatar(true)}><Trash2 /> Remove photo</button>}
              {!avatar && removeAvatar && <button type="button" className={styles.removeButton} disabled={!isEditing} onClick={() => setRemoveAvatar(false)}>Keep current photo</button>}
            </div>
          </div>
        </div>
        <div className={styles.fields}>
          <label>Full name<input value={fullName} onChange={(event) => setFullName(event.target.value)} minLength={2} maxLength={100} autoComplete="name" disabled={loading || saving || !isEditing} required /></label>
          <label>Position<input value={position} onChange={(event) => setPosition(event.target.value)} minLength={2} maxLength={80} placeholder="Administrator" disabled={loading || saving || !isEditing} required /></label>
          <label>Contact number <span>(optional)</span><input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} maxLength={30} autoComplete="tel" placeholder="Enter contact number" disabled={loading || saving || !isEditing} /></label>
          <label>Email address <span>(sign-in account)</span><input type="email" value={user?.email ?? ''} disabled readOnly /></label>
        </div>
        <p className={styles.note}>The email address is managed through Firebase Authentication and cannot be changed from this form.</p>
        {error && <p className={styles.error} role="alert">{error}</p>}
        <button className={styles.submit} type="submit" disabled={loading || saving || !isEditing}><Save /> {saving ? 'Saving…' : 'Save profile'}</button>
      </form>
    </section>
  );
}
