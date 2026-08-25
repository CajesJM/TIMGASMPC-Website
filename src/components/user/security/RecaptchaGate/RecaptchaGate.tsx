import { ShieldCheck, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "@/styles/user/components/security/RecaptchaGate.module.css";

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
    onTimgasRecaptchaLoad?: () => void;
  }
}

let captchaScript: Promise<RecaptchaApi> | null = null;
const captchaScriptId = "timgas-recaptcha-api";
const captchaLoadTimeout = 15_000;

function loadRecaptcha() {
  if (window.grecaptcha) return Promise.resolve(window.grecaptcha);
  if (captchaScript) return captchaScript;

  captchaScript = new Promise<RecaptchaApi>((resolve, reject) => {
    let settled = false;
    const script = document.createElement("script");
    script.id = captchaScriptId;
    script.src =
      "https://www.google.com/recaptcha/api.js?onload=onTimgasRecaptchaLoad&render=explicit";
    script.async = true;
    script.defer = true;

    const finish = (api: RecaptchaApi) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      delete window.onTimgasRecaptchaLoad;
      resolve(api);
    };
    const fail = (error: Error) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      delete window.onTimgasRecaptchaLoad;
      script.remove();
      captchaScript = null;
      reject(error);
    };

    window.onTimgasRecaptchaLoad = () => {
      if (window.grecaptcha) {
        finish(window.grecaptcha);
      } else {
        fail(new Error("reCAPTCHA did not finish initializing."));
      }
    };
    script.onerror = () => fail(new Error("reCAPTCHA could not be loaded."));
    const timeoutId = window.setTimeout(
      () => fail(new Error("reCAPTCHA loading timed out.")),
      captchaLoadTimeout,
    );

    document.getElementById(captchaScriptId)?.remove();
    document.head.append(script);
  });

  return captchaScript;
}

type RecaptchaGateProps = {
  applicationName: string;
  open: boolean;
  purpose?: "opening" | "submitting";
  onClose: () => void;
  onVerified: (token: string) => void;
};

export function RecaptchaGate({
  applicationName,
  open,
  purpose = "opening",
  onClose,
  onVerified,
}: RecaptchaGateProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | undefined>(undefined);
  const verificationCompletedRef = useRef(false);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY?.trim();
  const isTestEnvironment = import.meta.env.MODE === "test";
  const configurationError = !siteKey
    ? "reCAPTCHA has not been configured yet. Please contact TIMGAS MPC."
    : "";

  useEffect(() => {
    if (!open) return;

    widgetIdRef.current = undefined;
    verificationCompletedRef.current = false;

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
          callback: (token) => {
            verificationCompletedRef.current = true;
            onVerified(token);
          },
          "expired-callback": () => {
            verificationCompletedRef.current = false;
            setStatus("ready");
            setMessage("The verification expired. Please check the box again.");
          },
          "error-callback": () => {
            setStatus("error");
            setMessage(
              "Verification could not be completed. Check your connection and try again.",
            );
          },
        });
        setStatus("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("error");
        setMessage(
          "Verification could not be loaded. Disable content blockers or check your connection, then try again.",
        );
      });

    return () => {
      cancelled = true;
      if (
        !verificationCompletedRef.current &&
        widgetIdRef.current !== undefined &&
        window.grecaptcha
      ) {
        window.grecaptcha.reset(widgetIdRef.current);
      }
      widgetIdRef.current = undefined;
    };
  }, [isTestEnvironment, onVerified, open, siteKey]);

  if (!open) return null;

  return createPortal(
    <div
      className={styles.backdrop}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="recaptcha-title"
        aria-describedby="recaptcha-description"
      >
        <button
          className={styles.closeButton}
          type="button"
          onClick={onClose}
          aria-label="Close verification"
        >
          <X aria-hidden="true" />
        </button>
        <div className={styles.icon}>
          <ShieldCheck aria-hidden="true" />
        </div>
        <p className={styles.eyebrow}>Security check</p>
        <h2 id="recaptcha-title">Verify before continuing</h2>
        <p id="recaptcha-description">
          Please complete the security check before{" "}
          {purpose === "submitting" ? "submitting" : "opening"} the{" "}
          {applicationName.toLowerCase()}.
        </p>
        {isTestEnvironment ? (
          <label className={styles.testCheckbox}>
            <input
              type="checkbox"
              onChange={(event) => {
                if (event.target.checked) {
                  verificationCompletedRef.current = true;
                  onVerified("test-recaptcha-token");
                }
              }}
            />{" "}
            I’m not a robot
          </label>
        ) : (
          <div className={styles.captchaArea} aria-live="polite">
            <div ref={containerRef} />
            <p hidden={status !== "loading"}>Loading security check…</p>
          </div>
        )}
        {(message || configurationError) && (
          <p className={styles.error} role="alert">
            {message || configurationError}
          </p>
        )}
        <p className={styles.privacy}>
          This check is provided by Google reCAPTCHA and is subject to Google’s
          Privacy Policy and Terms of Service.
        </p>
      </section>
    </div>,
    document.body,
  );
}
