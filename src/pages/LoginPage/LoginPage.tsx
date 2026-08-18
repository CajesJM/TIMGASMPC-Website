import { zodResolver } from "@hookform/resolvers/zod";
import {
  getIdTokenResult,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { ArrowLeft, Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "../../components/Button/Button";
import { auth, isFirebaseConfigured } from "../../lib/firebase";
import styles from "./LoginPage.module.css";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginValues = z.infer<typeof schema>;
type LoginLocationState = { from?: string; reason?: "unauthorized" | "setup" };

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LoginLocationState | null;
  const {
    register,
    handleSubmit,
    getValues,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(schema) });

  const login = async ({ email, password }: LoginValues) => {
    setAuthError("");
    setStatusMessage("");

    if (!auth) {
      setAuthError("Firebase is not configured yet. Complete the project connection before signing in.");
      return;
    }

    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const token = await getIdTokenResult(credential.user, true);

      if (token.claims.admin !== true) {
        await signOut(auth);
        setAuthError("This account does not have TIMGAS manager access.");
        return;
      }

      navigate(locationState?.from ?? "/manager/preview", { replace: true });
    } catch {
      setAuthError("Unable to sign in. Check your credentials and internet connection, then try again.");
    }
  };

  const resetPassword = async () => {
    setAuthError("");
    setStatusMessage("");
    const emailIsValid = await trigger("email");
    if (!emailIsValid) return;
    if (!auth) {
      setAuthError("Firebase is not configured yet.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, getValues("email"));
      setStatusMessage("If that manager account exists, Firebase has sent password-reset instructions.");
    } catch {
      setAuthError("Password reset is unavailable right now. Try again later.");
    }
  };

  const setupRequired = !isFirebaseConfigured || locationState?.reason === "setup";

  return (
    <section className={styles.page}>
      <div className={styles.panel}>
        <Link to="/" className={styles.back}>
          <ArrowLeft size={17} /> Back to website
        </Link>
        <div className={styles.icon}><LockKeyhole /></div>
        <p className="eyebrow">Authorized access only</p>
        <h1>Manager sign in</h1>
        <p>Manage applications, website content, and cooperative announcements.</p>
        <div className={`${styles.notice} ${setupRequired ? styles.setupNotice : ""}`}>
          <ShieldCheck size={18} />
          <span>
            {setupRequired
              ? "Firebase connection is pending. Sign-in will be enabled after the project configuration and first manager account are added."
              : "Access requires a verified Firebase account with the TIMGAS administrator role."}
          </span>
        </div>
        {locationState?.reason === "unauthorized" && (
          <p className={styles.errorBanner}>Your account is not authorized to open the manager dashboard.</p>
        )}
        {authError && <p className={styles.errorBanner} role="alert">{authError}</p>}
        {statusMessage && <p className={styles.successBanner} role="status">{statusMessage}</p>}
        <form onSubmit={handleSubmit(login)} noValidate>
          <label htmlFor="email">Email address</label>
          <input id="email" type="email" autoComplete="username" {...register("email")} />
          {errors.email && <small>{errors.email.message}</small>}
          <label htmlFor="password">Password</label>
          <div className={styles.password}>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>
          {errors.password && <small>{errors.password.message}</small>}
          <Button type="submit" disabled={isSubmitting || setupRequired}>
            {isSubmitting ? "Signing in…" : "Sign in securely"}
          </Button>
          <button className={styles.reset} type="button" onClick={resetPassword} disabled={setupRequired}>
            Forgot your password?
          </button>
        </form>
      </div>
    </section>
  );
}
