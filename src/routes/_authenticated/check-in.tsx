import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { MobileFrame } from "@/components/MobileFrame";
import { MOODS, type MoodValue } from "@/lib/haven-constants";
import { getTodayMood, submitMood } from "@/lib/feed.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/check-in")({
  component: CheckIn,
});

function CheckIn() {
  const navigate = useNavigate();
  const today = useServerFn(getTodayMood);
  const save = useServerFn(submitMood);
  const [picked, setPicked] = useState<MoodValue | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    today().then((d) => {
      if (d?.mood) navigate({ to: "/home", replace: true });
    });
  }, [today, navigate]);

  const submit = async () => {
    if (!picked) return;
    setBusy(true);
    try {
      await save({ data: { mood: picked } });
      navigate({ to: "/home" });
    } catch {
      toast.error("Couldn't save your mood.");
      setBusy(false);
    }
  };

  return (
    <MobileFrame>
      <div className="flex-1 flex flex-col px-6 pt-20 pb-10">
        <h1 className="font-serif italic text-4xl text-sage-900 text-balance mb-3">
          How are you feeling today?
        </h1>
        <p className="text-sage-700/60 text-sm mb-10">There are no wrong answers.</p>

        <div className="grid grid-cols-2 gap-3 mb-auto">
          {MOODS.map((m) => {
            const on = picked === m.value;
            return (
              <button
                key={m.value}
                onClick={() => setPicked(m.value)}
                className={cn(
                  "p-5 rounded-2xl border flex flex-col items-center gap-2 transition-all",
                  on
                    ? "bg-sage-600 text-cream border-sage-600 shadow-md shadow-sage-600/20"
                    : "bg-white border-sage-100 hover:border-sage-300",
                )}
              >
                <span className="text-3xl">{m.emoji}</span>
                <span className="text-xs font-medium">{m.label}</span>
              </button>
            );
          })}
        </div>

        <button
          disabled={!picked || busy}
          onClick={submit}
          className="mt-8 py-3.5 rounded-full bg-sage-900 text-cream font-medium text-sm disabled:opacity-40"
        >
          Save
        </button>
      </div>
    </MobileFrame>
  );
}
