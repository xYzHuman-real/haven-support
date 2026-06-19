import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { MobileFrame } from "@/components/MobileFrame";
import { TabBar } from "@/components/TabBar";
import { MoodChart } from "@/components/MoodChart";
import { BadgeGrid } from "@/components/BadgeGrid";
import { getProfileStats } from "@/lib/feed.functions";
import {
  getEncouragementStats,
  getMoodHistory,
  getMyBadges,
} from "@/lib/v2.functions";
import { journeyByKey } from "@/lib/journeys";
import { supabase } from "@/integrations/supabase/client";

const statsQO = () =>
  queryOptions({ queryKey: ["profile-stats"], queryFn: () => getProfileStats() });
const encQO = () =>
  queryOptions({ queryKey: ["enc-stats"], queryFn: () => getEncouragementStats() });
const moodQO = () =>
  queryOptions({
    queryKey: ["mood-history", 30],
    queryFn: () => getMoodHistory({ data: { days: 30 } }),
  });
const badgesQO = () =>
  queryOptions({ queryKey: ["my-badges"], queryFn: () => getMyBadges() });

export const Route = createFileRoute("/_authenticated/profile")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(statsQO());
    context.queryClient.ensureQueryData(encQO());
    context.queryClient.ensureQueryData(moodQO());
    context.queryClient.ensureQueryData(badgesQO());
  },
  component: ProfilePage,
});

function ProfilePage() {
  const { data } = useSuspenseQuery(statsQO());
  const { data: enc } = useSuspenseQuery(encQO());
  const { data: mood } = useSuspenseQuery(moodQO());
  const { data: badges } = useSuspenseQuery(badgesQO());
  const [range, setRange] = useState<7 | 30>(7);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const journey = journeyByKey(data.journey);
  const subs = data.subcategories.length > 0 ? data.subcategories : data.exams;

  return (
    <MobileFrame>
      <header className="px-6 pt-14 pb-6 text-center">
        <div className="size-20 mx-auto rounded-full bg-sage-100 grid place-items-center text-2xl font-display font-bold text-sage-900 border border-sage-600/10 mb-3">
          {data.display_name[0]?.toUpperCase() ?? "S"}
        </div>
        <h1 className="font-display font-bold text-3xl text-sage-900">{data.display_name}</h1>
        {journey && (
          <p className="text-sm text-sage-700/70 mt-1">
            {journey.emoji} {journey.name}
          </p>
        )}
      </header>

      <main className="flex-1 overflow-y-auto px-6 pb-28 space-y-4">
        <div className="bg-sage-900 text-cream rounded-3xl p-6 flex items-center gap-4">
          <div className="text-4xl">🌱</div>
          <div>
            <div className="font-display font-bold text-3xl">
              {data.streak} day{data.streak === 1 ? "" : "s"}
            </div>
            <div className="text-xs text-sage-100/70">check-in streak</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-rose-50 to-amber-50 rounded-3xl p-5 border border-rose-100">
          <div className="flex items-center gap-3">
            <div className="text-3xl">❤️</div>
            <div className="flex-1">
              <div className="font-display font-bold text-2xl text-sage-900">
                {enc.given_this_week}
              </div>
              <div className="text-xs text-sage-700/70">
                {enc.given_this_week === 1 ? "person" : "people"} encouraged this week
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-sage-700/70">{enc.given_total} total</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl border border-sage-100 p-4">
            <div className="text-2xl font-display font-semibold">{data.posts}</div>
            <div className="text-[11px] text-sage-700/60 mt-1">Posts shared</div>
          </div>
          <div className="bg-white rounded-2xl border border-sage-100 p-4">
            <div className="text-2xl font-display font-semibold">{data.encouragements}</div>
            <div className="text-[11px] text-sage-700/60 mt-1">Encouragements given</div>
          </div>
        </div>

        <section className="bg-white rounded-2xl border border-sage-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs uppercase tracking-wider text-sage-600/60 font-semibold">
              Mood history
            </div>
            <div className="flex gap-1">
              {([7, 30] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setRange(d)}
                  className={
                    range === d
                      ? "px-2.5 py-1 rounded-full text-[10px] font-semibold bg-sage-900 text-cream"
                      : "px-2.5 py-1 rounded-full text-[10px] font-semibold bg-sage-50 text-sage-700"
                  }
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>
          <MoodChart rows={mood} days={range} />
        </section>

        <section className="bg-white rounded-2xl border border-sage-100 p-5">
          <div className="text-xs uppercase tracking-wider text-sage-600/60 font-semibold mb-3">
            Helper badges
          </div>
          <BadgeGrid badges={badges} />
        </section>

        <section className="bg-white rounded-2xl border border-sage-100 p-5">
          <div className="text-xs uppercase tracking-wider text-sage-600/60 font-semibold mb-3">
            Your journey
          </div>
          {subs.length === 0 ? (
            <div className="text-sm text-sage-700/60">No paths chosen yet.</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {subs.map((s) => (
                <span
                  key={s}
                  className="px-3 py-1 rounded-full bg-sage-50 border border-sage-100 text-xs text-sage-700"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </section>

        <button
          onClick={signOut}
          className="w-full py-3 rounded-xl bg-white border border-sage-100 text-sm text-sage-700"
        >
          Sign out
        </button>
      </main>
      <TabBar />
    </MobileFrame>
  );
}
