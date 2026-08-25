import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  updateProfile,
} from "firebase/auth";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import {
  Camera,
  Check,
  KeyRound,
  Pencil,
  Save,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { auth } from "@/services/firebase/firebase";
import { db } from "@/services/firebase/firestore";
import { deleteStorageFile, storage } from "@/services/firebase/storage";
import type { ShowToast } from "@/features/notifications/toastTypes";
import styles from "@/styles/admin/components/profile/AdminProfileManager.module.css";

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
const acceptedAvatarTypes = ["image/jpeg", "image/png", "image/webp"];

function safeFileName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function AdminProfileManager({
  onProfileChange,
  showToast,
}: AdminProfileManagerProps) {
  const user = auth?.currentUser;
  const [fullName, setFullName] = useState(user?.displayName ?? "");
  const [position, setPosition] = useState("Administrator");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [existingAvatarUrl, setExistingAvatarUrl] = useState(
    user?.photoURL ?? "",
  );
  const [existingAvatarPath, setExistingAvatarPath] = useState("");
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [savedProfile, setSavedProfile] = useState({
    fullName: user?.displayName ?? "",
    position: "Administrator",
    phone: "",
    avatarUrl: user?.photoURL ?? "",
    avatarPath: "",
  });
  const [loading, setLoading] = useState(Boolean(db && user));
  const [saving, setSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [error, setError] = useState(
    db && user ? "" : "Manager profile is unavailable.",
  );
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const avatarPreview = useMemo(
    () => (avatar ? URL.createObjectURL(avatar) : ""),
    [avatar],
  );
  const passwordChecks = useMemo(
    () => [
      { label: "At least 10 characters", passed: newPassword.length >= 10 },
      { label: "An uppercase letter", passed: /[A-Z]/.test(newPassword) },
      { label: "A lowercase letter", passed: /[a-z]/.test(newPassword) },
      { label: "A number", passed: /\d/.test(newPassword) },
      {
        label: "A symbol, such as ! @ # or %",
        passed: /[^A-Za-z0-9]/.test(newPassword),
      },
    ],
    [newPassword],
  );
  const passedPasswordChecks = passwordChecks.filter(
    (check) => check.passed,
  ).length;
  const passwordStrength =
    passedPasswordChecks <= 2
      ? "Weak"
      : passedPasswordChecks === 3
        ? "Fair"
        : passedPasswordChecks === 4
          ? "Strong"
          : "Very strong";
  const newPasswordIsValid = passedPasswordChecks === passwordChecks.length;
  const passwordsMatch =
    confirmPassword.length > 0 && newPassword === confirmPassword;

  useEffect(() => {
    if (!db || !user) return;
    const firestore = db;
    let active = true;

    void getDoc(doc(firestore, "adminProfiles", user.uid))
      .then((snapshot) => {
        if (!active) return;
        const data = snapshot.data();
        const nextName =
          typeof data?.fullName === "string" && data.fullName.trim()
            ? data.fullName
            : (user.displayName ?? "");
        const nextPosition =
          typeof data?.position === "string" && data.position.trim()
            ? data.position
            : "Administrator";
        setFullName(nextName);
        setPosition(nextPosition);
        const nextPhone = typeof data?.phone === "string" ? data.phone : "";
        const nextAvatarPath =
          typeof data?.avatarPath === "string" ? data.avatarPath : "";
        setPhone(nextPhone);
        const nextAvatarUrl =
          typeof data?.avatarUrl === "string"
            ? data.avatarUrl
            : (user.photoURL ?? "");
        setExistingAvatarUrl(nextAvatarUrl);
        setExistingAvatarPath(nextAvatarPath);
        setSavedProfile({
          fullName: nextName,
          position: nextPosition,
          phone: nextPhone,
          avatarUrl: nextAvatarUrl,
          avatarPath: nextAvatarPath,
        });
        onProfileChange({
          fullName: nextName,
          position: nextPosition,
          avatarUrl: nextAvatarUrl,
        });
      })
      .catch((profileError) => {
        console.error("Unable to load the manager profile.", profileError);
        if (active) setError("The manager profile could not be loaded.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
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
      event.target.value = "";
      return setError("Use a JPEG, PNG, or WebP profile photo.");
    }
    if (selectedAvatar.size > maximumAvatarSize) {
      event.target.value = "";
      return setError("The profile photo must be smaller than 2 MB.");
    }
    setError("");
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
      setError("");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordError("");
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
    setIsEditing((current) => !current);
  };

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!db || !user || !isEditing) return;
    const nextName = fullName.trim();
    const nextPosition = position.trim();
    if (!nextName || !nextPosition)
      return setError("Name and position are required.");

    setSaving(true);
    setError("");
    let uploadedAvatarPath = "";
    try {
      let nextAvatarUrl = removeAvatar ? "" : existingAvatarUrl;
      let nextAvatarPath = removeAvatar ? "" : existingAvatarPath;

      if (avatar) {
        if (!storage) throw new Error("Firebase Storage is not configured.");
        uploadedAvatarPath = `profiles/${user.uid}/${Date.now()}-${safeFileName(avatar.name)}`;
        const avatarReference = ref(storage, uploadedAvatarPath);
        await uploadBytes(avatarReference, avatar, {
          contentType: avatar.type,
        });
        nextAvatarUrl = await getDownloadURL(avatarReference);
        nextAvatarPath = uploadedAvatarPath;
      }

      await setDoc(
        doc(db, "adminProfiles", user.uid),
        {
          fullName: nextName,
          position: nextPosition,
          phone: phone.trim(),
          email: user.email ?? "",
          avatarUrl: nextAvatarUrl,
          avatarPath: nextAvatarPath,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      try {
        await updateProfile(user, {
          displayName: nextName,
          photoURL: nextAvatarUrl || null,
        });
      } catch (authProfileError) {
        console.error(
          "Firebase Authentication profile synchronization failed.",
          authProfileError,
        );
      }

      let oldAvatarCleanupFailed = false;
      const previousAvatarLocation = existingAvatarPath || existingAvatarUrl;
      const nextAvatarLocation = nextAvatarPath || nextAvatarUrl;
      if (
        (removeAvatar || uploadedAvatarPath) &&
        previousAvatarLocation &&
        previousAvatarLocation !== nextAvatarLocation
      ) {
        try {
          await deleteStorageFile(existingAvatarPath, existingAvatarUrl);
        } catch (cleanupError) {
          oldAvatarCleanupFailed = true;
          console.error(
            "The previous profile photo could not be removed from Storage.",
            cleanupError,
          );
        }
      }

      setFullName(nextName);
      setPosition(nextPosition);
      setPhone(phone.trim());
      setAvatar(null);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
      setRemoveAvatar(false);
      setExistingAvatarUrl(nextAvatarUrl);
      setExistingAvatarPath(nextAvatarPath);
      setSavedProfile({
        fullName: nextName,
        position: nextPosition,
        phone: phone.trim(),
        avatarUrl: nextAvatarUrl,
        avatarPath: nextAvatarPath,
      });
      setIsEditing(false);
      onProfileChange({
        fullName: nextName,
        position: nextPosition,
        avatarUrl: nextAvatarUrl,
      });
      showToast(
        oldAvatarCleanupFailed
          ? "Profile updated, but the previous photo could not be removed from Storage."
          : "Profile updated successfully.",
        oldAvatarCleanupFailed ? "warning" : "success",
      );
    } catch (saveError) {
      console.error("Unable to save the manager profile.", saveError);
      if (uploadedAvatarPath)
        await deleteStorageFile(uploadedAvatarPath).catch(() => undefined);
      const failureMessage =
        "The profile could not be saved. Please try again.";
      setError(failureMessage);
      showToast(failureMessage, "error");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (!auth || !user || !user.email) {
      setPasswordError("Password changes are unavailable for this account.");
      return;
    }
    if (!newPasswordIsValid) {
      setPasswordError("Use a stronger password that meets every requirement.");
      return;
    }
    if (!passwordsMatch) {
      setPasswordError("The new password and confirmation do not match.");
      return;
    }

    setChangingPassword(true);
    setPasswordError("");
    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword,
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showToast("Password changed successfully. Keep it private.", "success");
    } catch (changeError) {
      console.error("Unable to change the manager password.", changeError);
      const code =
        typeof changeError === "object" && changeError && "code" in changeError
          ? String(changeError.code)
          : "";
      const message =
        code === "auth/invalid-credential" || code === "auth/wrong-password"
          ? "Your current password is incorrect."
          : code === "auth/too-many-requests"
            ? "Too many attempts. Please wait a moment and try again."
            : "Your password could not be changed. Please try again.";
      setPasswordError(message);
      showToast(message, "error");
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <section
      className={styles.manager}
      id="profile"
      aria-labelledby="profile-heading"
    >
      <div className={styles.heading}>
        <div>
          <p className="eyebrow">Manager account</p>
          <h2 id="profile-heading">Personal profile</h2>
          <p>
            Keep the manager information shown inside this secure dashboard up
            to date.
          </p>
        </div>
        <button
          className={`${styles.editToggle} ${isEditing ? styles.editToggleActive : ""}`}
          type="button"
          onClick={toggleEditing}
          aria-pressed={isEditing}
          disabled={loading || saving}
        >
          <Pencil aria-hidden="true" />
          <span>{isEditing ? "Editing" : "Edit profile"}</span>
          <i aria-hidden="true">
            <b />
          </i>
        </button>
      </div>
      <form
        className={`${styles.form} ${!isEditing ? styles.formLocked : ""}`}
        onSubmit={saveProfile}
        aria-busy={loading || saving}
      >
        <div className={styles.avatarEditor}>
          <div className={styles.avatarPreview}>
            {avatarPreview || (!removeAvatar && existingAvatarUrl) ? (
              <img
                src={avatarPreview || existingAvatarUrl}
                alt="Manager profile preview"
              />
            ) : (
              <UserRound aria-hidden="true" />
            )}
          </div>
          <div className={styles.avatarActions}>
            <div>
              <strong>Profile photo</strong>
              <p>Use a square JPEG, PNG, or WebP image under 2 MB.</p>
            </div>
            <div className={styles.avatarButtons}>
              <label className={styles.photoButton} aria-disabled={!isEditing}>
                <Camera />{" "}
                {existingAvatarUrl || avatar ? "Change photo" : "Add photo"}
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={selectAvatar}
                  disabled={loading || saving || !isEditing}
                />
              </label>
              {avatar && (
                <button
                  type="button"
                  className={styles.removeButton}
                  disabled={!isEditing}
                  onClick={() => {
                    setAvatar(null);
                    if (avatarInputRef.current)
                      avatarInputRef.current.value = "";
                  }}
                >
                  <X /> Cancel new photo
                </button>
              )}
              {!avatar && existingAvatarUrl && !removeAvatar && (
                <button
                  type="button"
                  className={styles.removeButton}
                  disabled={!isEditing}
                  onClick={() => setRemoveAvatar(true)}
                >
                  <Trash2 /> Remove photo
                </button>
              )}
              {!avatar && removeAvatar && (
                <button
                  type="button"
                  className={styles.removeButton}
                  disabled={!isEditing}
                  onClick={() => setRemoveAvatar(false)}
                >
                  Keep current photo
                </button>
              )}
            </div>
          </div>
        </div>
        <div className={styles.fields}>
          <label>
            Full name
            <input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              minLength={2}
              maxLength={100}
              autoComplete="name"
              disabled={loading || saving || !isEditing}
              required
            />
          </label>
          <label>
            Position
            <input
              value={position}
              onChange={(event) => setPosition(event.target.value)}
              minLength={2}
              maxLength={80}
              placeholder="Administrator"
              disabled={loading || saving || !isEditing}
              required
            />
          </label>
          <label>
            Contact number <span>(optional)</span>
            <input
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              maxLength={30}
              autoComplete="tel"
              placeholder="Enter contact number"
              disabled={loading || saving || !isEditing}
            />
          </label>
          <label>
            Email address <span>(sign-in account)</span>
            <input type="email" value={user?.email ?? ""} disabled readOnly />
          </label>
        </div>
        <section
          className={`${styles.passwordPanel} ${!isEditing ? styles.passwordLocked : ""}`}
          aria-labelledby="password-heading"
        >
          <div className={styles.passwordHeading}>
            <span className={styles.passwordIcon} aria-hidden="true">
              <KeyRound />
            </span>
            <div>
              <h3 id="password-heading">Change password</h3>
              <p>Confirm your current password before setting a new one.</p>
            </div>
          </div>
          <div
            className={styles.passwordForm}
            onKeyDown={(event) => {
              if (event.key !== "Enter") return;
              event.preventDefault();
              if (
                !changingPassword &&
                !loading &&
                currentPassword &&
                newPasswordIsValid &&
                passwordsMatch
              ) {
                void changePassword();
              }
            }}
          >
            <label>
              Current password
              <input
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                autoComplete="current-password"
                disabled={changingPassword || loading || !isEditing}
              />
            </label>
            <label>
              New password
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                autoComplete="new-password"
                disabled={changingPassword || loading || !isEditing}
              />
            </label>
            <label>
              Confirm new password
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                disabled={changingPassword || loading || !isEditing}
              />
              {confirmPassword && (
                <small
                  className={passwordsMatch ? styles.match : styles.noMatch}
                >
                  {passwordsMatch
                    ? "Passwords match."
                    : "Passwords do not match."}
                </small>
              )}
            </label>
            <div
              className={styles.passwordGuidance}
              data-strength={passwordStrength.toLowerCase().replace(" ", "-")}
              aria-live="polite"
            >
              <div className={styles.strengthLine}>
                <span>Password strength</span>
                <strong
                  data-strength={passwordStrength
                    .toLowerCase()
                    .replace(" ", "-")}
                >
                  {newPassword ? passwordStrength : "Not set"}
                </strong>
              </div>
              <div className={styles.strengthMeter} aria-hidden="true">
                <i
                  style={
                    {
                      "--strength": `${passedPasswordChecks * 20}%`,
                    } as CSSProperties
                  }
                />
              </div>
              <ul>
                {passwordChecks.map((check) => (
                  <li
                    key={check.label}
                    className={check.passed ? styles.checkPassed : ""}
                  >
                    <Check aria-hidden="true" />
                    {check.label}
                  </li>
                ))}
              </ul>
            </div>
            {passwordError && (
              <p className={styles.error} role="alert">
                {passwordError}
              </p>
            )}
            <button
              className={styles.passwordSubmit}
              type="button"
              onClick={() => void changePassword()}
              disabled={
                changingPassword ||
                loading ||
                !isEditing ||
                !currentPassword ||
                !newPasswordIsValid ||
                !passwordsMatch
              }
            >
              <KeyRound />{" "}
              {changingPassword ? "Changing password…" : "Change password"}
            </button>
          </div>
        </section>

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        <button
          className={styles.submit}
          type="submit"
          disabled={loading || saving || !isEditing}
        >
          <Save /> {saving ? "Saving…" : "Save profile"}
        </button>
      </form>
    </section>
  );
}
