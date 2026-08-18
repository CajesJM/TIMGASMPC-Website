import { zodResolver } from "@hookform/resolvers/zod";
import {
  getIdTokenResult,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  MailCheck,
} from "lucide-react";
import { useState, type CSSProperties } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import loginBackground from "../../assets/images/timgas-office-hero-v2.jpg";
import timgasLogo from "../../assets/images/timgas-logo.png";
import { Button } from "../../components/Button/Button";
import { auth } from "../../lib/firebase";
import styles from "./LoginPage.module.css";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginValues = z.infer<typeof schema>;
type LoginLocationState = { from?: string; reason?: "unauthorized" | "setup" };

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
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
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(schema) });

  const login = async ({ email, password }: LoginValues) => {
    setAuthError("");
    setStatusMessage("");
    if (!auth)
      return setAuthError(
        "Firebase is not configured yet. Complete the project connection before signing in.",
      );

    try {
      const credential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );
      const token = await getIdTokenResult(credential.user, true);
      if (token.claims.admin !== true) {
        await signOut(auth);
        setAuthError("This account does not have TIMGAS manager access.");
        return;
      }
      navigate(locationState?.from ?? "/manager/preview", { replace: true });
    } catch {
      setAuthError(
        "Unable to sign in. Check your credentials and internet connection, then try again.",
      );
    }
  };

  const openReset = () => {
    setResetMode(true);
    setShowPassword(false);
    setAuthError("");
    setStatusMessage("");
    clearErrors();
  };

  const returnToLogin = () => {
    setResetMode(false);
    setAuthError("");
    setStatusMessage("");
    clearErrors();
  };

  const resetPassword = async () => {
    setAuthError("");
    setStatusMessage("");
    if (!(await trigger("email"))) return;
    if (!auth) return setAuthError("Firebase is not configured yet.");

    setIsResetting(true);
    try {
      await sendPasswordResetEmail(auth, getValues("email").trim());
      setStatusMessage(
        "Reset link sent. Check your email inbox and spam folder.",
      );
    } catch {
      setAuthError(
        "The reset link could not be sent. Check your connection and try again.",
      );
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <section
      className={styles.page}
      style={
        { "--login-background": `url(${loginBackground})` } as CSSProperties
      }
    >
      <div className={styles.curves} aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className={styles.panel}>
        <Link to="/" className={styles.back}>
          <ArrowLeft /> Back to website
        </Link>
        <div className={styles.icon}>
          <img src={timgasLogo} alt="TIMGAS MPC" />
        </div>
        <div className={styles.intro}>
          <p className="eyebrow">Secure manager portal</p>
          <h1>{resetMode ? "Reset your password" : "Manager sign in"}</h1>
          <p>
            {resetMode
              ? "Enter the manager email address and we’ll send a secure reset link."
              : "Access applications and manage verified TIMGAS MPC website updates."}
          </p>
        </div>

        {locationState?.reason === "unauthorized" && !resetMode && (
          <p className={styles.errorBanner}>
            Your account is not authorized to open the manager dashboard.
          </p>
        )}
        {authError && (
          <p className={styles.errorBanner} role="alert">
            {authError}
          </p>
        )}
        {statusMessage && (
          <p className={styles.successBanner} role="status">
            <MailCheck />
            <span>{statusMessage}</span>
          </p>
        )}

        <form
          onSubmit={
            resetMode
              ? (event) => {
                  event.preventDefault();
                  void resetPassword();
                }
              : handleSubmit(login)
          }
          noValidate
        >
          <label htmlFor="email">Email address</label>
          <div className={styles.field}>
            <Mail aria-hidden="true" />
            <input
              id="email"
              type="email"
              autoComplete="username"
              placeholder="manager@timgasmpc.com"
              {...register("email")}
            />
          </div>
          {errors.email && <small>{errors.email.message}</small>}

          {!resetMode && (
            <>
              <div className={styles.passwordLabel}>
                <label htmlFor="password">Password</label>
                <button type="button" onClick={openReset}>
                  Forgot password?
                </button>
              </div>
              <div className={`${styles.field} ${styles.password}`}>
                <LockKeyhole aria-hidden="true" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
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
            </>
          )}

          <Button
            className={styles.submit}
            type="submit"
            disabled={isSubmitting || isResetting}
          >
            {resetMode ? (
              isResetting ? (
                "Sending link…"
              ) : (
                <>
                  Send reset link <ArrowRight />
                </>
              )
            ) : isSubmitting ? (
              "Signing in…"
            ) : (
              <>
                Sign in securely <ArrowRight />
              </>
            )}
          </Button>
          {resetMode && (
            <button
              className={styles.returnLogin}
              type="button"
              onClick={returnToLogin}
            >
              <ArrowLeft /> Return to sign in
            </button>
          )}
        </form>
        <p className={styles.securityLine}>TIMGAS MPC administrator access</p>
      </div>
    </section>
  );
}
