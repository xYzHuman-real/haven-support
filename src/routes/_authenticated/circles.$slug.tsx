import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { MobileFrame } from "@/components/MobileFrame";
import { TabBar } from "@/components/TabBar";
import { getCircle, toggleJoinCircle } from "@/lib/v2.functions";

const qo = (slug: string) =>
  queryOptions({
    queryKey: ["circle", slug],
    queryFn: () => getCircle({ data: { slug } }),
  });

export const Route = createFileRoute("/_authenticated/circles/$slug")({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(qo(params.slug)),
  component: CirclePage,
});

function CirclePage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(qo(slug));
  const qc = useQueryClient();
  const join = useServerFn(toggleJoinCircle);
  const m = useMutation({
    mutationFn: (next: boolean) => join({ data: { slug, join: next } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["circle", slug] });
      qc.invalidateQueries({ queryKey: ["circles"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Couldn't update"),
  });

  const meta = data.circle;
  if (!meta) {
    return (
      <MobileFrame>
        <div className="flex-1 grid place-items-center text-sm text-sage-700/60">
          Circle not found.
        </div>
      </MobileFrame>
    );
  }

  const wins = data.posts.filter((p) => p.win).slice(0, 5);
  const struggles = data.posts.filter((p) => p.struggle).slice(0, 5);
  const goals = data.posts.filter((p) => p.goal).slice(0, 5);

  return (
    <MobileFrame>
      <header className="px-6 pt-12 pb-4 flex items-center gap-3 border-b border-sage-100">
        <Link to="/circles" className="-ml-2 p-2 rounded-full hover:bg-sage-50">
          <ChevronLeft className="size-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-sage-600/60">{meta.emoji} Circle</div>
          <h1 className="font-display font-bold text-2xl text-sage-900 truncate">
            {meta.name}
          </h1>
        </div>
        <button
          onClick={() => m.mutate(!data.joined)}
          disabled={m.isPending}
          className={
            data.joined
              ? "px-4 py-2 rounded-full text-xs font-medium bg-sage-50 text-sage-700 border border-sage-200"
              : "px-4 py-2 rounded-full text-xs font-medium bg-sage-900 text-cream"
          }
        >
          {data.joined ? "Joined" : "Join"}
        </button>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-5 pb-28 space-y-5">
        <p className="text-sm text-sage-700/70 leading-relaxed">{meta.description}</p>
        <div className="bg-white rounded-2xl border border-sage-100 p-4 flex items-center gap-3">
          <div className="text-2xl">👥</div>
          <div>
            <div className="font-semibold text-sage-900">{data.member_count}</div>
            <div className="text-xs text-sage-600/60">members in this circle</div>
          </div>
        </div>

        <Section title="Recent wins" emoji="✨" items={wins.map((p) => p.win)} />
        <Section title="Recent struggles" emoji="🫂" items={struggles.map((p) => p.struggle)} />
        <Section title="Shared goals" emoji="🎯" items={goals.map((p) => p.goal)} />
      </main>
      <TabBar />
    </MobileFrame>
  );
}

function Section({ title, emoji, items }: { title: string; emoji: string; items: string[] }) {
  return (
    <section>
      <h2 className="text-xs uppercase tracking-wider font-semibold text-sage-600/70 mb-2">
        {emoji} {title}
      </h2>
      {items.length === 0 ? (
        <div className="text-xs text-sage-700/50 bg-sage-50/50 rounded-xl p-4 text-center">
          Nothing here yet — be the first to share.
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((t, i) => (
            <li
              key={i}
              className="text-sm text-sage-800 bg-white border border-sage-100 rounded-xl p-3 leading-relaxed"
            >
              {t}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
