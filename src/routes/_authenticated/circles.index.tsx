import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { MobileFrame } from "@/components/MobileFrame";
import { TabBar } from "@/components/TabBar";
import { listCircles } from "@/lib/v2.functions";
import { JOURNEYS, journeyByKey } from "@/lib/journeys";
import { cn } from "@/lib/utils";

const qo = () => queryOptions({ queryKey: ["circles"], queryFn: () => listCircles() });

export const Route = createFileRoute("/_authenticated/circles/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(qo()),
  component: CirclesIndex,
});

function CirclesIndex() {
  const { data: circles } = useSuspenseQuery(qo());
  const [filter, setFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return circles;
    if (filter === "mine") return circles.filter((c) => c.joined);
    return circles.filter((c) => c.journey === filter);
  }, [circles, filter]);

  return (
    <MobileFrame>
      <header className="px-6 pt-12 pb-3">
        <h1 className="font-display font-bold text-3xl text-sage-900">Circles</h1>
        <p className="text-sage-700/60 text-sm mt-1">Small communities, real support.</p>
      </header>
      <div className="px-6 pb-3 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {[
            { key: "all", label: "All" },
            { key: "mine", label: "Joined" },
            ...JOURNEYS.map((j) => ({ key: j.key, label: `${j.emoji} ${j.name}` })),
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap",
                filter === f.key
                  ? "bg-sage-900 text-cream border-sage-900"
                  : "bg-white text-sage-700 border-sage-100",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <main className="flex-1 overflow-y-auto px-6 pb-28 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center text-sm text-sage-700/60 py-16">
            No circles here yet.
          </div>
        ) : (
          filtered.map((c) => (
            <Link
              key={c.slug}
              to="/circles/$slug"
              params={{ slug: c.slug }}
              className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-sage-100 hover:border-sage-300 transition"
            >
              <div className="size-12 rounded-xl bg-sage-50 grid place-items-center text-2xl">
                {c.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-sage-900">{c.name}</div>
                <div className="text-xs text-sage-600/60 truncate">
                  {journeyByKey(c.journey)?.name ?? c.journey}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-sage-700/70">{c.member_count}</div>
                <div className="text-[10px] text-sage-600/50">
                  {c.joined ? "Joined" : "members"}
                </div>
              </div>
            </Link>
          ))
        )}
      </main>
      <TabBar />
    </MobileFrame>
  );
}
