import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Plus } from "lucide-react";
import { MobileFrame } from "@/components/MobileFrame";
import { TabBar } from "@/components/TabBar";
import { PostCard, type FeedPost } from "@/components/PostCard";
import { getFeed, getProfile, getTodayMood, submitMood } from "@/lib/feed.functions";
import { greeting, moodMeta, MOODS, type MoodValue } from "@/lib/haven-constants";

const feedQO = () =>
  queryOptions({
    queryKey: ["feed"],
    queryFn: () => getFeed({ data: {} }) as Promise<FeedPost[]>,
  });
const profileQO = () => queryOptions({ queryKey: ["profile"], queryFn: () => getProfile() });
const moodQO = () => queryOptions({ queryKey: ["mood-today"], queryFn: () => getTodayMood() });

export const Route = createFileRoute("/_authenticated/home")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(feedQO());
    context.queryClient.ensureQueryData(profileQO());
    context.queryClient.ensureQueryData(moodQO());
  },
  component: Home,
});

function MoodChip() {
  const { data } = useSuspenseQuery(moodQO());
  const qc = useQueryClient();
  const save = useServerFn(submitMood);
  const m = useMutation({
    mutationFn: (mood: MoodValue) => save({ data: { mood } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mood-today"] }),
  });
  const current = moodMeta(data?.mood);
  return (
    <div className="bg-sage-600/5 rounded-2xl p-4 border border-sage-600/10">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs uppercase tracking-wider font-semibold text-sage-600/60">
          Current Vibe
        </p>
        {current && <span className="text-[11px] text-sage-700">{current.label}</span>}
      </div>
      <div className="flex justify-between gap-1">
        {MOODS.map((mo) => {
          const on = data?.mood === mo.value;
          return (
            <button
              key={mo.value}
              onClick={() => m.mutate(mo.value)}
              className={
                on
                  ? "size-12 rounded-xl bg-sage-600 grid place-items-center text-xl shadow-md shadow-sage-600/20"
                  : "size-12 rounded-xl bg-white grid place-items-center text-xl shadow-sm grayscale hover:grayscale-0 transition"
              }
              title={mo.label}
            >
              {mo.emoji}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Feed() {
  const { data: posts } = useSuspenseQuery(feedQO());
  if (!posts.length) {
    return (
      <section className="bg-white rounded-3xl border border-sage-100 p-8 text-center">
        <div className="text-4xl mb-3">🌱</div>
        <h2 className="font-serif italic text-xl mb-1">Nothing here yet.</h2>
        <p className="text-sm text-sage-700/60 mb-4">Be the first to share today.</p>
        <Link
          to="/create"
          className="inline-block px-5 py-2 rounded-full bg-sage-900 text-cream text-xs font-medium"
        >
          Share your day
        </Link>
      </section>
    );
  }
  return (
    <>
      {posts.map((p) => (
        <PostCard key={p.id} post={p} />
      ))}
    </>
  );
}

function Home() {
  const { data: profile } = useSuspenseQuery(profileQO());
  const name = profile?.display_name ?? "there";
  return (
    <MobileFrame>
      <header className="px-6 pt-12 pb-5">
        <div className="flex justify-between items-center mb-5">
          <div>
            <p className="text-xs text-sage-600/60">{greeting()},</p>
            <h1 className="font-serif italic text-3xl">{name} 👋</h1>
          </div>
          <Link
            to="/profile"
            className="size-10 rounded-full bg-sage-100 grid place-items-center text-xs font-semibold border border-sage-600/10"
          >
            {name[0]?.toUpperCase() ?? "S"}
          </Link>
        </div>
        <MoodChip />
      </header>

      <main className="flex-1 overflow-y-auto px-6 space-y-5 pb-28">
        <section className="bg-sage-900 text-cream rounded-3xl p-6 shadow-xl">
          <h2 className="font-serif italic text-2xl mb-1 text-white">Ready to share?</h2>
          <p className="text-sage-100/70 text-sm mb-4">One win. One struggle. One goal.</p>
          <Link
            to="/create"
            className="inline-block w-full text-center py-3 bg-sage-100 text-sage-900 font-semibold rounded-xl text-sm"
          >
            Log Daily Trio
          </Link>
        </section>
        <Feed />
      </main>

      <Link
        to="/create"
        className="absolute bottom-24 right-5 size-14 bg-sage-600 text-cream rounded-full shadow-xl grid place-items-center z-20"
      >
        <Plus className="size-6" />
      </Link>

      <TabBar />
    </MobileFrame>
  );
}
