"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";

type ScoreRow = {
  id: string;
  quizId: string;
  quizTitle: string;
  score: number;
  total: number;
  createdAt: Date | null;
};

export default function ScoresPage() {
  const { user, loading } = useAuth();
  const [scores, setScores] = useState<ScoreRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setIsLoading(true);
      const ref = collection(firestore, "users", user.uid, "scores");
      const snap = await getDocs(query(ref, orderBy("createdAt", "desc")));
      const rows: ScoreRow[] = snap.docs.map((d) => {
        const raw = d.data() as any;
        return {
          id: d.id,
          quizId: raw.quizId,
          quizTitle: raw.quizTitle ?? "Untitled quiz",
          score: raw.score ?? 0,
          total: raw.total ?? 0,
          createdAt: raw.createdAt?.toDate ? raw.createdAt.toDate() : null,
        };
      });
      setScores(rows);
      setIsLoading(false);
    };
    load();
  }, [user]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-200">
        Loading scores...
      </div>
    );
  }

  // Group by quizId
  const grouped: Record<string, ScoreRow[]> = {};
  for (const s of scores) {
    if (!grouped[s.quizId]) grouped[s.quizId] = [];
    grouped[s.quizId].push(s);
  }

  const groups = Object.entries(grouped);

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-8">
        <div className="mb-6 space-y-1">
          <h1 className="text-lg font-semibold">Score history</h1>
          <p className="text-xs text-slate-400">
            See how your performance changes over time for each quiz.
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-1 items-center justify-center text-sm text-slate-300">
            Loading...
          </div>
        ) : groups.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-6 text-center text-sm text-slate-300">
            No score history yet. Play a quiz to see your progress here.
          </div>
        ) : (
          <div className="space-y-5 text-sm">
            {groups.map(([quizId, attempts]) => {
              const title = attempts[0]?.quizTitle ?? "Untitled quiz";
              return (
                <section
                  key={quizId}
                  className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4"
                >
                  <div className="mb-3 flex items-center justify-between text-xs">
                    <div>
                      <h2 className="font-medium">{title}</h2>
                      <p className="text-[11px] text-slate-400">
                        {attempts.length} attempt
                        {attempts.length === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    {attempts.map((a) => {
                      const pct =
                        a.total > 0
                          ? Math.round((a.score / a.total) * 100)
                          : 0;
                      return (
                        <div
                          key={a.id}
                          className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2"
                        >
                          <div className="space-y-0.5">
                            <p className="text-[11px] text-slate-300">
                              {a.createdAt
                                ? a.createdAt.toLocaleString()
                                : "Unknown date"}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              Score:{" "}
                              <span className="font-medium text-slate-100">
                                {a.score}/{a.total}
                              </span>{" "}
                              ({pct}%)
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

