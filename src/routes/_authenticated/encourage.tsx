import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { MobileFrame } from "@/components/MobileFrame";
import { TabBar } from "@/components/TabBar";
import { getEncouragementsToday } from "@/lib/feed.functions";
import { ENCOURAGEMENTS } from "@/lib/haven-constants";

const qo = () =>
  queryOptions({ queryKey: ["encouragements-today"], queryFn: () => getEncouragementsToday() });

export const Route = createFileRoute("/_authenticated/encourage")({
  loader: ({ context }) => context.queryClient.ensureQueryData(qo()),
  component: EncouragePage,
});

function EncouragePage() {
  const { data } = useSuspenseQuery(qo());
  return (
    <MobileFrame>
      <header className="px-6 pt-12 pb-4">
        <h1 className="font-serif italic text-3xl">Today's care</h1>
        <p className="text-sage-700/60 text-sm mt-1">The kindness you've offered.</p>
      </header>
      <main className="flex-1 overflow-y-auto px-6 pb-28 space-y-5">
        <section className="bg-sage-900 text-cream rounded-3xl p-6 text-center">
          <div className="text-5xl font-serif italic">{data.students}</div>
          <p className="text-sage-100/70 text-sm mt-1">
            student{data.students === 1 ? "" : "s"} you encouraged today
          </p>
          <div className="mt-4 text-xs text-sage-100/50">
            {data.count} kind {data.count === 1 ? "word" : "words"} sent
          </div>
        </section>

        {data.items.length === 0 ? (
          <div className="text-center text-sm text-sage-700/60 mt-6">
            Send a little kindness — it goes further than you think.
            <div className="mt-4">
              <Link
                to="/home"
                className="inline-block px-5 py-2 rounded-full bg-sage-900 text-cream text-xs"
              >
                Open the feed
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {data.items.map((it: any) => {
              const meta = ENCOURAGEMENTS.find((e) => e.kind === it.kind);
              return (
                <div
                  key={it.id}
                  className="bg-white rounded-2xl border border-sage-100 p-4 flex items-start gap-3"
                >
                  <div className="text-xl">{meta?.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{meta?.label}</div>
                    <div className="text-xs text-sage-700/60 truncate">
                      {it.posts?.is_anonymous ? "Anonymous" : "On"} — "
                      {(it.posts?.win ?? "").slice(0, 60)}…"
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <TabBar />
    </MobileFrame>
  );
}
