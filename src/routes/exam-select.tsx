import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MobileFrame } from "@/components/MobileFrame";
import { COMMUNITIES } from "@/lib/haven-constants";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/exam-select")({
  ssr: false,
  component: ExamSelect,
});

const KEY = "haven_pending_exams";

function ExamSelect() {
  const [picked, setPicked] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setPicked(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = (slug: string) =>
    setPicked((p) => (p.includes(slug) ? p.filter((x) => x !== slug) : [...p, slug]));

  const next = () => {
    localStorage.setItem(KEY, JSON.stringify(picked));
    navigate({ to: "/auth" });
  };

  return (
    <MobileFrame>
      <div className="flex-1 flex flex-col px-6 pt-14 pb-8 overflow-y-auto">
        <h1 className="font-serif italic text-3xl text-sage-900 mb-2">Choose your journey</h1>
        <p className="text-sage-700/60 text-sm mb-8">
          Pick the paths you're walking. You can change this anytime.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {COMMUNITIES.map((c) => {
            const on = picked.includes(c.slug);
            return (
              <button
                key={c.slug}
                onClick={() => toggle(c.slug)}
                className={cn(
                  "p-4 rounded-2xl border text-left transition-all",
                  on
                    ? "bg-sage-600 text-cream border-sage-600 shadow-md shadow-sage-600/20"
                    : "bg-white border-sage-100 hover:border-sage-300",
                )}
              >
                <div className="text-2xl mb-3">{c.icon}</div>
                <div className={cn("font-semibold text-sm", on ? "text-cream" : "text-sage-900")}>
                  {c.name}
                </div>
                <div
                  className={cn("text-[11px] mt-0.5", on ? "text-cream/70" : "text-sage-600/60")}
                >
                  {c.blurb}
                </div>
              </button>
            );
          })}
        </div>
        <button
          disabled={picked.length === 0}
          onClick={next}
          className="mt-8 py-3.5 rounded-full bg-sage-900 text-cream font-medium text-sm disabled:opacity-40"
        >
          Continue
        </button>
      </div>
    </MobileFrame>
  );
}
