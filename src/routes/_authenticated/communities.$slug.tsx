import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { MobileFrame } from "@/components/MobileFrame";
import { TabBar } from "@/components/TabBar";
import { PostCard, type FeedPost } from "@/components/PostCard";
import { getFeed } from "@/lib/feed.functions";
import { COMMUNITIES } from "@/lib/haven-constants";

const feedQO = (slug: string) =>
  queryOptions({
    queryKey: ["feed", slug],
    queryFn: () => getFeed({ data: { community: slug } }) as Promise<FeedPost[]>,
  });

export const Route = createFileRoute("/_authenticated/communities/$slug")({
  loader: ({ context, params }) => {
    context.queryClient.ensureQueryData(feedQO(params.slug));
  },
  component: CommunityPage,
});

function CommunityPage() {
  const { slug } = Route.useParams();
  const meta = COMMUNITIES.find((c) => c.slug === slug);
  const { data: posts } = useSuspenseQuery(feedQO(slug));
  return (
    <MobileFrame>
      <header className="px-6 pt-12 pb-4 flex items-center gap-3 border-b border-sage-100">
        <Link to="/communities" className="-ml-2 p-2 rounded-full hover:bg-sage-50">
          <ChevronLeft className="size-5" />
        </Link>
        <div>
          <div className="text-xs text-sage-600/60">{meta?.icon} Community</div>
          <h1 className="font-serif italic text-2xl">{meta?.name ?? slug}</h1>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto px-6 py-5 space-y-4 pb-28">
        {posts.length === 0 ? (
          <div className="text-center text-sm text-sage-700/60 mt-12">
            No posts here yet. Start the conversation.
          </div>
        ) : (
          posts.map((p) => <PostCard key={p.id} post={p} />)
        )}
      </main>
      <TabBar />
    </MobileFrame>
  );
}
