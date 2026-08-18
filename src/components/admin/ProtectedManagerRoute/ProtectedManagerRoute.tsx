import { getIdTokenResult, onAuthStateChanged, signOut } from "firebase/auth";
import { useEffect, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { auth, isFirebaseConfigured } from "../../../lib/firebase";
import styles from "./ProtectedManagerRoute.module.css";

type AccessState =
  | "checking"
  | "allowed"
  | "signed-out"
  | "forbidden"
  | "not-configured";

export function ProtectedManagerRoute({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [access, setAccess] = useState<AccessState>(
    isFirebaseConfigured ? "checking" : "not-configured",
  );

  useEffect(() => {
    if (!auth) return;
    const firebaseAuth = auth;

    return onAuthStateChanged(firebaseAuth, async (user) => {
      if (!user) {
        setAccess("signed-out");
        return;
      }

      try {
        const token = await getIdTokenResult(user, true);
        if (token.claims.admin === true) {
          setAccess("allowed");
          return;
        }

        await signOut(firebaseAuth);
        setAccess("forbidden");
      } catch {
        setAccess("signed-out");
      }
    });
  }, []);

  if (access === "checking") {
    return (
      <main className={styles.status} aria-live="polite">
        <div className={styles.spinner} aria-hidden="true" />
        <p>Verifying manager access…</p>
      </main>
    );
  }

  if (access !== "allowed") {
    const reason =
      access === "forbidden"
        ? "unauthorized"
        : access === "not-configured"
          ? "setup"
          : undefined;
    return (
      <Navigate
        to="/manager-login"
        replace
        state={{ from: location.pathname, reason }}
      />
    );
  }

  return children;
}
