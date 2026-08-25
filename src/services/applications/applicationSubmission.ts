import { httpsCallable } from "firebase/functions";
import { functions } from "@/services/firebase/firebase";

type ApplicationCollection = "applications" | "loanApplications";

type SubmissionResponse = { id: string; reference: string };

export async function submitApplicationWithCaptcha(
  collection: ApplicationCollection,
  application: Record<string, unknown>,
  recaptchaToken: string,
) {
  if (!functions) throw new Error("Firebase Functions is not configured.");
  if (!recaptchaToken)
    throw new Error("Complete the security check before submitting.");

  const callable = httpsCallable<
    {
      collection: ApplicationCollection;
      application: Record<string, unknown>;
      recaptchaToken: string;
    },
    SubmissionResponse
  >(functions, "submitApplication");
  const result = await callable({ collection, application, recaptchaToken });
  return result.data;
}
