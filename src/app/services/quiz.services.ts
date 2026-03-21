import { firestore, firebaseCollections } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  addDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { PDFParse } from "pdf-parse";

interface Question {
  question: string;
  correctIndex: number;
  options: string[];
}

export const createQuiz = async (userId: string, questions: any[]) => {};

export const parsePdf = async (buffer: Buffer): Promise<string> => {
  try {
    const parser = new PDFParse({ data: buffer });

    const result = await parser.getText();
    console.log(result.text);
    return result.text;
  } catch (err) {
    console.error("Error parsing PDF:", err);
    return "";
  }
};

type BadgeDefinition = {
  code: string;
  name: string;
  description: string;
  icon: string;
  predicate: (args: {
    totalQuizzesPlayed: number;
    highScorePercentage: number;
    lastScorePercentage: number;
  }) => boolean;
};

const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    code: "first_quiz",
    name: "First Steps",
    description: "Completed your first quiz.",
    icon: "🥉",
    predicate: ({ totalQuizzesPlayed }) => totalQuizzesPlayed >= 1,
  },
  {
    code: "quiz_enthusiast",
    name: "Quiz Enthusiast",
    description: "Completed 5 quizzes.",
    icon: "📚",
    predicate: ({ totalQuizzesPlayed }) => totalQuizzesPlayed >= 5,
  },
  {
    code: "high_achiever",
    name: "High Achiever",
    description: "Scored at least 80% on a quiz.",
    icon: "🏅",
    predicate: ({ highScorePercentage }) => highScorePercentage >= 80,
  },
  {
    code: "perfect_score",
    name: "Perfect Score",
    description: "Scored 100% on a quiz.",
    icon: "🏆",
    predicate: ({ highScorePercentage }) => highScorePercentage >= 100,
  },
];

const evaluateAndAwardBadges = async (
  userId: string,
  latestScore: number,
  total: number
) => {
  try {
    const scoresRef = firebaseCollections.userScores(userId);
    const scoresSnap = await getDocs(scoresRef);

    const totalQuizzesPlayed = scoresSnap.size;
    let highScorePercentage = 0;

    scoresSnap.forEach((docSnap) => {
      const data = docSnap.data() as any;
      if (!data.total) return;
      const pct = Math.round((data.score / data.total) * 100);
      if (pct > highScorePercentage) {
        highScorePercentage = pct;
      }
    });

    const lastScorePercentage =
      total > 0 ? Math.round((latestScore / total) * 100) : 0;

    const badgesRef = firebaseCollections.userBadges(userId);
    const existingBadgesSnap = await getDocs(badgesRef);
    const existingCodes = new Set(
      existingBadgesSnap.docs.map((d) => (d.data() as any).code as string)
    );

    const context = {
      totalQuizzesPlayed,
      highScorePercentage,
      lastScorePercentage,
    };

    const badgesToAward = BADGE_DEFINITIONS.filter(
      (def) => def.predicate(context) && !existingCodes.has(def.code)
    );

    await Promise.all(
      badgesToAward.map((def) =>
        addDoc(badgesRef, {
          code: def.code,
          name: def.name,
          description: def.description,
          icon: def.icon,
          earnedAt: serverTimestamp(),
        })
      )
    );
  } catch (err) {
    console.error("error evaluating badges: ", err);
  }
};

export const saveQuiz = async (
  userId: string,
  quiz: any,
  finalScore: number,
  total: number
) => {
  try {
    const scoresRef = collection(firestore, "users", userId, "scores");
    const q = query(scoresRef, where("quizId", "==", quiz.id));
    const existing = await getDocs(q);

    if (!existing.empty) {
      const existingDoc = existing.docs[0];
      await setDoc(doc(scoresRef, existingDoc.id), {
        quizId: quiz.id,
        quizTitle: quiz.title,
        score: finalScore,
        total,
        createdAt: serverTimestamp(),
      });
    } else {
      await addDoc(scoresRef, {
        quizId: quiz.id,
        quizTitle: quiz.title,
        score: finalScore,
        total,
        createdAt: serverTimestamp(),
      });
    }

    await evaluateAndAwardBadges(userId, finalScore, total);

    return { success: true };
  } catch (err) {
    console.log("error saving quiz: ", err);
    return {
      success: false,
    };
  }
};

export const deleteQuiz = async (userId: string, quizId: string) => {
  try {
    const quizRef = doc(firestore, "users", userId, "quizzes", quizId);
    await deleteDoc(quizRef);
    return { success: true };
  } catch (err) {
    console.error("Error deleting quiz: ", err);
    return { success: false };
  }
};