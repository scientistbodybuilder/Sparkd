"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { firestore, type Quiz } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";

type AnswerBreakdown = {
  question: string;
  options: string[];
  correctIndex: number;
};

export default function QuizResultsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading } = useAuth();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [latestScore, setLatestScore] = useState<{ score: number; total: number } | null>(null);

  useEffect(() => {
    if (!user || !params?.id) return;
    const load = async () => {
      const quizRef = doc(firestore, "users", user.uid, "quizzes", params.id);
      const quizSnap = await getDoc(quizRef);
      if (!quizSnap.exists()) {
        router.replace("/dashboard");
        return;
      }
      const raw = quizSnap.data() as any;
      const q: Quiz = {
        id: quizSnap.id,
        title: raw.title,
        createdAt: raw.createdAt,
        lastScore: raw.lastScore ?? undefined,
        totalQuestions: raw.totalQuestions ?? (raw.questions?.length ?? 0),
        questions: raw.questions ?? [],
      };
      setQuiz(q);

      const scoresRef = collection(firestore, "users", user.uid, "scores");
      const scoresSnap = await getDocs(
        query(
          scoresRef,
          where("quizId", "==", params.id),
          orderBy("createdAt", "desc")
        )
      );
      const s = scoresSnap.docs[0]?.data() as any | undefined;
      if (s) {
        setLatestScore({ score: s.score, total: s.total });
      }
    };
    load();
  }, [user, params?.id, router]);

  if (loading || !user || !quiz || !latestScore) {
    return (
      <div className="flex flex-1 items-center justify-center bg-slate-950 text-slate-200">
        Loading results...
      </div>
    );
  }

  const percentage =
    latestScore.total > 0
      ? Math.round((latestScore.score / latestScore.total) * 100)
      : 0;

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-slate-950 text-slate-50">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-10">
        <div className="mb-8 space-y-2 text-center">
          <h1 className="text-lg font-semibold">Results</h1>
          <p className="text-sm text-slate-300">{quiz.title}</p>
        </div>

        <section className="mb-4 flex flex-col items-center gap-4">
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-semibold text-emerald-400">
              {latestScore.score}/{latestScore.total}
            </span>
            <span className="text-sm text-slate-400">correct</span>
          </div>
          <div className="text-sm text-slate-300">
            Accuracy:{" "}
            <span className="font-semibold text-emerald-400">
              {percentage}%
            </span>
          </div>
        </section>

        <section className="mb-4 space-y-4 text-sm">
          <h2 className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Question breakdown
          </h2>
          <div className='h-[50dvh] rounded-xl overflow-y-auto w-auto'>
              <div className="space-y-3">
            {quiz.questions.map((q: AnswerBreakdown, idx: number) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4"
              >
                <p className="mb-3 text-xs font-medium text-slate-200">
                  Q{idx + 1}. {q.question}
                </p>
                <div className="grid gap-2">
                  {q.options.map((opt, optIdx) => {
                    const isCorrect = optIdx === q.correctIndex;
                    return (
                      <div
                        key={optIdx}
                        className={`flex items-center justify-between rounded-xl border px-3 py-2 text-xs ${
                          isCorrect
                            ? "border-emerald-500/80 bg-emerald-500/10 text-emerald-200"
                            : "border-slate-800 bg-slate-900 text-slate-200"
                        }`}
                      >
                        <span>{opt}</span>
                        {isCorrect && (
                          <span className="text-[10px] uppercase tracking-wide">
                            Correct
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          </div>
          
        </section>

        <div className="mt-4 flex justify-center gap-3 text-xs">
          <button
            onClick={() => router.push(`/quiz/${quiz.id}`)}
            className="rounded-full bg-slate-100 px-5 py-2 font-medium text-slate-900 hover:bg-white"
          >
            Retry quiz
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-full border border-slate-700 px-5 py-2 text-slate-100 hover:bg-slate-800"
          >
            Back to dashboard
          </button>
        </div>
      </main>
    </div>
  );
}

