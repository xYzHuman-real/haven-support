import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { MobileFrame } from "@/components/MobileFrame";
import { TabBar } from "@/components/TabBar";
import { COMMUNITIES } from "@/lib/haven-constants";
import { getCommunityCounts } from "@/lib/feed.functions";

const countsQO = () =>
  queryOptions({ queryKey: ["community-counts"], queryFn: () => getCommunityCounts() });

export const Route = createFileRoute("/_authenticated/communities")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(countsQO());
  },
  component: CommunitiesShell,
});

function CommunitiesShell() {
  return <Outlet />;
}

// The index leaf is registered as /_authenticated/communities/ via separate file
export function CommunitiesIndex() {
  const { data: counts } = useSuspenseQuery(countsQO());
  return (
    <MobileFrame>
      <header className="px-6 pt-12 pb-4">
        <h1 className="font-serif italic text-3xl">Communities</h1>
        <p className="text-sage-700/60 text-sm mt-1">Find your people.</p>
      </header>
      <main className="flex-1 overflow-y-auto px-6 pb-28 space-y-3">
        {COMMUNITIES.map((c) => (
          <Link
            key={c.slug}
            to="/communities/$slug"
            params={{ slug: c.slug }}
            className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-sage-100"
          >
            <div className="size-12 rounded-xl bg-sage-50 grid place-items-center text-2xl">
              {c.icon}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm">{c.name}</div>
              <div className="text-xs text-sage-600/60">{c.blurb}</div>
            </div>
            <div className="text-xs text-sage-700/60">{counts[c.slug] ?? 0} posts</div>
          </Link>
        ))}
      </main>
      <TabBar />
    </MobileFrame>
  );
}
