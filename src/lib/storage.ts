import { getStorage, type FirebaseStorage } from "firebase/storage";
import { firebaseApp } from "./firebase";

export const storage: FirebaseStorage | null = firebaseApp
  ? getStorage(firebaseApp)
  : null;
