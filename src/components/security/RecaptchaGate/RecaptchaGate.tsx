import { ShieldCheck, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./RecaptchaGate.module.css";

type RecaptchaApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
    },
  ) => number;
  reset: (widgetId?: number) => void;
};

declare global {
  interface Window {
    grecaptcha?: RecaptchaApi;
  }
}

let captchaScript: Promise<RecaptchaApi> | null = null;

function loadRecaptcha() {
  if (window.grecaptcha) return Promise.resolve(window.grecaptcha);
  if (captchaScript) return captchaScript;

  captchaScript = new Promise<RecaptchaApi>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://www.google.com/recaptcha/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.grecaptcha) resolve(window.grecaptcha);
      else reject(new Error("reCAPTCHA did not finish loading."));
    };
    script.onerror = () => reject(new Error("reCAPTCHA could not be loaded."));
    document.head.append(script);
  });

  return captchaScript;
}

type RecaptchaGateProps = {
  applicationName: string;
  open: boolean;
  onClose: () => void;
  onVerified: (token: string) => void;
};

export function RecaptchaGate({ applicationName, open, onClose, onVerified }: RecaptchaGateProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | undefined>(undefined);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState("");
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY?.trim();
  const isTestEnvironment = import.meta.env.MODE === "test";
  const configurationError = !siteKey
    ? "reCAPTCHA has not been configured yet. Please contact TIMGAS MPC."
    : "";

  useEffect(() => {
    if (!open) return;

    if (isTestEnvironment) {
      return;
    }

    if (!siteKey) {
      return;
    }

    let cancelled = false;
    containerRef.current?.replaceChildren();

    void loadRecaptcha()
      .then((captcha) => {
        if (cancelled || !containerRef.current) return;
        widgetIdRef.current = captcha.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token) => onVerified(token),
          "expired-callback": () => setMessage("The verification expired. Please check the box again."),
          "error-callback": () => setMessage("Verification could not be completed. Check your connection and try again."),
        });
        setStatus("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("error");
        setMessage("Verification could not be loaded. Disable content blockers or check your connection, then try again.");
      });

    return () => {
      cancelled = true;
      if (widgetIdRef.current !== undefined && window.grecaptcha) {
        window.grecaptcha.reset(widgetIdRef.current);
      }
      widgetIdRef.current = undefined;
    };
  }, [isTestEnvironment, onVerified, open, siteKey]);

  if (!open) return null;

  return createPortal(
    <div className={styles.backdrop} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="recaptcha-title" aria-describedby="recaptcha-description">
        <button className={styles.closeButton} type="button" onClick={onClose} aria-label="Close verification"><X aria-hidden="true" /></button>
        <div className={styles.icon}><ShieldCheck aria-hidden="true" /></div>
        <p className={styles.eyebrow}>Security check</p>
        <h2 id="recaptcha-title">Verify before continuing</h2>
        <p id="recaptcha-description">Please complete the security check before opening the {applicationName.toLowerCase()}.</p>
        {isTestEnvironment ? (
          <label className={styles.testCheckbox}><input type="checkbox" onChange={(event) => { if (event.target.checked) onVerified("test-recaptcha-token"); }} /> I’m not a robot</label>
        ) : (
          <div className={styles.captchaArea} aria-live="polite"><div ref={containerRef} /><p hidden={status !== "loading"}>Loading security check…</p></div>
        )}
        {(message || configurationError) && <p className={styles.error} role="alert">{message || configurationError}</p>}
        <p className={styles.privacy}>This check is provided by Google reCAPTCHA and is subject to Google’s Privacy Policy and Terms of Service.</p>
      </section>
    </div>,
    document.body,
  );
}
