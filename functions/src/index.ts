import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { initializeApp } from "firebase-admin/app";
import { setGlobalOptions } from "firebase-functions";
import { HttpsError, onCall } from "firebase-functions/https";
import { defineSecret } from "firebase-functions/params";

initializeApp();
setGlobalOptions({ maxInstances: 10 });

const recaptchaSecret = defineSecret("RECAPTCHA_SECRET_KEY");
const allowedCollections = new Set(["applications", "loanApplications"]);

type RecaptchaResponse = { success?: boolean; hostname?: string; "error-codes"?: string[] };

export const submitApplication = onCall(
  { secrets: [recaptchaSecret], timeoutSeconds: 30 },
  async (request) => {
    const data = request.data as {
      collection?: unknown;
      application?: unknown;
      recaptchaToken?: unknown;
    } | undefined;
    const collection = data?.collection;
    const application = data?.application;
    const recaptchaToken = data?.recaptchaToken;

    if (typeof collection !== "string" || !allowedCollections.has(collection)) {
      throw new HttpsError("invalid-argument", "The application type is invalid.");
    }
    if (!application || typeof application !== "object" || Array.isArray(application)) {
      throw new HttpsError("invalid-argument", "The application payload is invalid.");
    }
    if (typeof recaptchaToken !== "string" || recaptchaToken.length < 1 || recaptchaToken.length > 4000) {
      throw new HttpsError("invalid-argument", "Complete the reCAPTCHA security check.");
    }

    const verification = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: recaptchaSecret.value(), response: recaptchaToken }),
    });
    if (!verification.ok) {
      throw new HttpsError("unavailable", "The reCAPTCHA service could not be reached.");
    }
    const result = await verification.json() as RecaptchaResponse;
    if (!result.success) {
      throw new HttpsError("permission-denied", "The reCAPTCHA verification failed.");
    }

    const clientApplication = { ...(application as Record<string, unknown>) };
    delete clientApplication.submittedAt;
    delete clientApplication.updatedAt;
    const savedApplication: Record<string, unknown> = {
      ...clientApplication,
      submittedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    const reference = typeof savedApplication.reference === "string" ? savedApplication.reference : "";
    const document = await getFirestore().collection(collection).add(savedApplication);
    return { id: document.id, reference };
  },
);
