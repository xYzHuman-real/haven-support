import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { MobileFrame } from "@/components/MobileFrame";
import { TabBar } from "@/components/TabBar";
import { getProfileStats } from "@/lib/feed.functions";
import { COMMUNITIES } from "@/lib/haven-constants";
import { supabase } from "@/integrations/supabase/client";

const qo = () =>
  queryOptions({ queryKey: ["profile-stats"], queryFn: () => getProfileStats() });

export const Route = createFileRoute("/_authenticated/profile")({
  loader: ({ context }) => context.queryClient.ensureQueryData(qo()),
  component: ProfilePage,
});

function ProfilePage() {
  const { data } = useSuspenseQuery(qo());
  const navigate = useNavigate();
  const qc = useQueryClient();

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const exams = COMMUNITIES.filter((c) => data.exams.includes(c.slug));

  return (
    <MobileFrame>
      <header className="px-6 pt-14 pb-6 text-center">
        <div className="size-20 mx-auto rounded-full bg-sage-100 grid place-items-center text-2xl font-serif italic text-sage-900 border border-sage-600/10 mb-3">
          {data.display_name[0]?.toUpperCase() ?? "S"}
        </div>
        <h1 className="font-serif italic text-3xl">{data.display_name}</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-6 pb-28 space-y-4">
        <div className="bg-sage-900 text-cream rounded-3xl p-6 flex items-center gap-4">
          <div className="text-4xl">🌱</div>
          <div>
            <div className="font-serif italic text-3xl">
              {data.streak} day{data.streak === 1 ? "" : "s"}
            </div>
            <div className="text-xs text-sage-100/70">check-in streak</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl border border-sage-100 p-4">
            <div className="text-2xl font-serif italic">{data.posts}</div>
            <div className="text-[11px] text-sage-700/60 mt-1">Posts shared</div>
          </div>
          <div className="bg-white rounded-2xl border border-sage-100 p-4">
            <div className="text-2xl font-serif italic">{data.encouragements}</div>
            <div className="text-[11px] text-sage-700/60 mt-1">Encouragements given</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-sage-100 p-5">
          <div className="text-xs uppercase tracking-wider text-sage-600/60 font-semibold mb-3">
            Your journey
          </div>
          {exams.length === 0 ? (
            <div className="text-sm text-sage-700/60">No paths chosen yet.</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {exams.map((e) => (
                <span
                  key={e.slug}
                  className="px-3 py-1 rounded-full bg-sage-50 border border-sage-100 text-xs text-sage-700"
                >
                  {e.icon} {e.name}
                </span>
              ))}
            </div>
          )}
        </div>

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
