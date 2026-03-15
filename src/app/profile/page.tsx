"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  firestore,
  firebaseCollections,
  type Badge,
  type ScoreEntry,
} from "@/lib/firebase";
import {
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  type DocumentData,
} from "firebase/firestore";

type UserProfile = {
  email: string | null;
  createdAt?: Date;
};

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [recentScores, setRecentScores] = useState<ScoreEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setIsLoading(true);

      const userRef = doc(firestore, "users", user.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data() as DocumentData | undefined;

      setProfile({
        email: user.email,
        createdAt: userData?.createdAt?.toDate
          ? userData.createdAt.toDate()
          : undefined,
      });

      const badgesRef = firebaseCollections.userBadges(user.uid);
      const badgesSnap = await getDocs(badgesRef);
      const badgeList: Badge[] = badgesSnap.docs.map((d) => {
        const data = d.data() as any;
        return {
          id: d.id,
          code: data.code,
          name: data.name,
          description: data.description,
          icon: data.icon,
          earnedAt: data.earnedAt,
        };
      });
      setBadges(
        badgeList.sort((a, b) => b.earnedAt.toMillis() - a.earnedAt.toMillis())
      );

      const scoresRef = firebaseCollections.userScores(user.uid);
      const scoresSnap = await getDocs(
        query(scoresRef, orderBy("createdAt", "desc"))
      );
      const scoreList: ScoreEntry[] = scoresSnap.docs.map((d) => {
        const data = d.data() as any;
        return {
          id: d.id,
          quizId: data.quizId,
          quizTitle: data.quizTitle,
          score: data.score,
          total: data.total,
          createdAt: data.createdAt,
        };
      });
      setRecentScores(scoreList.slice(0, 5));

      setIsLoading(false);
    };

    load();
  }, [user]);

  if (loading || !user || isLoading) {
    return (
      <div className="flex min-h-screen items-center bg-slate-950 justify-center text-slate-200">
        Loading profile...
      </div>
    );
  }

  const completedQuizzes = recentScores.length;
  const bestScoreEntry = recentScores.reduce<ScoreEntry | null>(
    (best, entry) => {
      if (!best) return entry;
      const bestPct =
        best.total > 0 ? best.score / best.total : 0;
      const entryPct =
        entry.total > 0 ? entry.score / entry.total : 0;
      return entryPct > bestPct ? entry : best;
    },
    null
  );

  return (
    <div className="flex flex-1 flex-col bg-slate-950 text-slate-50">
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-8">
        <section className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-lg font-semibold">Your profile</h1>
            <p className="mt-1 text-sm text-slate-300">
              Track your progress and badges earned from quizzes.
            </p>
            <div className="mt-4 space-y-1 text-xs text-slate-300">
              <p>
                <span className="text-slate-400">Email:</span>{" "}
                {profile?.email ?? "—"}
              </p>
              <p>
                <span className="text-slate-400">Member since:</span>{" "}
                {profile?.createdAt
                  ? profile.createdAt.toLocaleDateString()
                  : "—"}
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <h2 className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Quizzes completed
            </h2>
            <p className="mt-3 text-3xl font-semibold">
              {completedQuizzes}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <h2 className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Best score
            </h2>
            {bestScoreEntry ? (
              <div className="mt-3 space-y-1 text-sm">
                <p className="font-medium">
                  {bestScoreEntry.score}/{bestScoreEntry.total}
                </p>
                <p className="text-xs text-slate-400">
                  {bestScoreEntry.quizTitle}
                </p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-400">
                Play a quiz to see your best score.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <h2 className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Badges earned
            </h2>
            <p className="mt-3 text-3xl font-semibold">
              {badges.length}
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Badge collection
            </h2>
          </div>

          {badges.length === 0 ? (
            <p className="text-sm text-slate-400">
              You have not earned any badges yet. Play some quizzes to start collecting them.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-sm"
                >
                  <div className="mb-2 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-lg">
                      {badge.icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">
                        {badge.name}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {badge.earnedAt?.toDate
                          ? badge.earnedAt.toDate().toLocaleDateString()
                          : "Recently earned"}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300">
                    {badge.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

