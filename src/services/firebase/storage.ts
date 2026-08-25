import {
  deleteObject,
  getStorage,
  ref,
  type FirebaseStorage,
} from "firebase/storage";
import { firebaseApp } from "@/services/firebase/firebase";

export const storage: FirebaseStorage | null = firebaseApp
  ? getStorage(firebaseApp)
  : null;

export async function deleteStorageFile(
  primaryLocation: string,
  fallbackLocation = "",
) {
  const location = primaryLocation || fallbackLocation;
  if (!storage || !location) return;

  try {
    await deleteObject(ref(storage, location));
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "storage/object-not-found"
    )
      return;
    throw error;
  }
}
