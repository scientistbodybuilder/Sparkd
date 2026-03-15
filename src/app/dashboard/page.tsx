"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  firestore,
  firebaseCollections,
  type Quiz,
} from "@/lib/firebase";
import {
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";

export default function DashboardPage() {
  const { user, loading, signOutUser } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setIsLoadingQuizzes(true);
      const qRef = firebaseCollections.userQuizzes(user.uid);
      const qSnapshot = await getDocs(
        query(qRef, orderBy("createdAt", "desc"))
      );
      const data: Quiz[] = qSnapshot.docs.map((d) => {
        const raw = d.data() as any;
        return {
          id: d.id,
          title: raw.title,
          createdAt: raw.createdAt,
          lastScore: raw.lastScore ?? undefined,
          totalQuestions: raw.totalQuestions ?? (raw.questions?.length ?? 0),
          questions: raw.questions ?? [],
        };
      });
      setQuizzes(data);
      setIsLoadingQuizzes(false);
    };
    load();
  }, [user]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-200">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-slate-950 text-slate-50">

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-base font-medium">Library</h2>
            <p className="text-xs text-slate-400">
              Upload a new PDF to generate a quiz, or replay an existing one.
            </p>
          </div>
          <div className="flex gap-2 text-xs">
            <Link
              href="/upload"
              className="rounded-full bg-slate-100 px-4 py-2 font-medium text-slate-900 hover:bg-white"
            >
              New quiz from PDF
            </Link>
            <Link
              href="/scores"
              className="rounded-full border border-slate-700 px-4 py-2 text-slate-100 hover:bg-slate-800"
            >
              Score history
            </Link>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {isLoadingQuizzes ? (
            <div className="col-span-full flex items-center justify-center text-sm text-slate-300">
              Loading quizzes...
            </div>
          ) : quizzes.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-6 text-center text-sm text-slate-300">
              No quizzes yet. Upload a PDF to get started.
            </div>
          ) : (
            quizzes.map((quiz) => (
              <article
                key={quiz.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-sm"
              >
                <div className="space-y-2">
                  <h3 className="truncate text-sm font-semibold">
                    {quiz.title}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {quiz.totalQuestions} questions ·{" "}
                    {quiz.createdAt?.toDate
                      ? quiz.createdAt.toDate().toLocaleDateString()
                      : "—"}
                  </p>
                  {quiz.lastScore != null && (
                    <p className="text-xs text-emerald-400">
                      Last score: {quiz.lastScore} / {quiz.totalQuestions}
                    </p>
                  )}
                </div>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <Link
                    href={`/quiz/${quiz.id}`}
                    className="rounded-full bg-slate-100 px-4 py-2 font-medium text-slate-900 hover:bg-white"
                  >
                    Play
                  </Link>
                </div>
              </article>
            ))
          )}
        </section>
      </main>
    </div>
  );
}

