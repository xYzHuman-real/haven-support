import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ENCOURAGEMENTS, type EncouragementKind, initialsOf } from "@/lib/haven-constants";
import { sendEncouragement } from "@/lib/feed.functions";
import { cn } from "@/lib/utils";

export type FeedPost = {
  id: string;
  win: string;
  struggle: string;
  goal: string;
  is_anonymous: boolean;
  community: string | null;
  created_at: string;
  author_name: string;
  my_kinds: EncouragementKind[];
};

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function PostCard({ post }: { post: FeedPost }) {
  const qc = useQueryClient();
  const send = useServerFn(sendEncouragement);
  const [pending, setPending] = useState<EncouragementKind | null>(null);
  const [local, setLocal] = useState<EncouragementKind[]>(post.my_kinds);

  const m = useMutation({
    mutationFn: (kind: EncouragementKind) => send({ data: { postId: post.id, kind } }),
    onMutate: (kind) => {
      setPending(kind);
      setLocal((prev) => (prev.includes(kind) ? prev : [...prev, kind]));
    },
    onError: (_e, kind) => {
      setLocal((prev) => prev.filter((k) => k !== kind));
      toast.error("Couldn't send. Try again.");
    },
    onSettled: () => {
      setPending(null);
      qc.invalidateQueries({ queryKey: ["encouragements-today"] });
    },
  });

  const display = post.is_anonymous ? "Anonymous" : post.author_name;
  const initials = post.is_anonymous ? "·" : initialsOf(display);

  return (
    <article className="bg-white rounded-3xl border border-sage-100 p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="size-10 rounded-full bg-sage-50 border border-sage-100 grid place-items-center text-xs font-semibold text-sage-700">
          {initials}
        </div>
        <div>
          <p className="font-semibold text-sm">{display}</p>
          <p className="text-xs text-sage-600/60">
            {post.community ? `${post.community.toUpperCase()} • ` : ""}
            {timeAgo(post.created_at)}
          </p>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">The Win</span>
          <p className="text-sm leading-relaxed mt-0.5">{post.win}</p>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-amber-600 tracking-wider">The Struggle</span>
          <p className="text-sm leading-relaxed mt-0.5">{post.struggle}</p>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">The Goal</span>
          <p className="text-sm leading-relaxed mt-0.5">{post.goal}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {ENCOURAGEMENTS.map((e) => {
          const given = local.includes(e.kind);
          return (
            <button
              key={e.kind}
              disabled={given || pending === e.kind}
              onClick={() => m.mutate(e.kind)}
              className={cn(
                "px-3 py-2 rounded-lg text-[11px] font-medium border transition-colors flex items-center justify-center gap-1.5",
                given
                  ? "bg-sage-600 text-white border-sage-600"
                  : "bg-sage-50 text-sage-700 border-sage-100 hover:bg-sage-100",
              )}
            >
              <span>{e.icon}</span>
              <span>{e.label}</span>
            </button>
          );
        })}
      </div>
    </article>
  );
}
