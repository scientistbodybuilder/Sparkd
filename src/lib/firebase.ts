import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (
  !firebaseConfig.apiKey ||
  !firebaseConfig.authDomain ||
  !firebaseConfig.projectId ||
  !firebaseConfig.storageBucket ||
  !firebaseConfig.messagingSenderId ||
  !firebaseConfig.appId
) {
  // These will surface during development if env vars are missing.
  console.warn(
    "Firebase env vars are missing. Check your NEXT_PUBLIC_FIREBASE_* values."
  );
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
};

export type Quiz = {
  id: string;
  title: string;
  createdAt: Timestamp;
  lastScore?: number;
  totalQuestions: number;
  questions: QuizQuestion[];
};

export type ScoreEntry = {
  id: string;
  quizId: string;
  quizTitle: string;
  score: number;
  total: number;
  createdAt: Timestamp;
};

export type Badge = {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Timestamp;
};

export const firebaseCollections = {
  userQuizzes: (userId: string) =>
    collection(firestore, "users", userId, "quizzes"),
  userScores: (userId: string) =>
    collection(firestore, "users", userId, "scores"),
  userBadges: (userId: string) =>
    collection(firestore, "users", userId, "badges"),
};

