import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { MobileFrame } from "@/components/MobileFrame";
import { JOURNEYS, PENDING_V2_KEY, type JourneyKey } from "@/lib/journeys";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/exam-select")({
  ssr: false,
  component: JourneySelect,
});

type Pending = { journey: JourneyKey | null; subcategories: string[] };

function JourneySelect() {
  const [step, setStep] = useState<1 | 2>(1);
  const [state, setState] = useState<Pending>({ journey: null, subcategories: [] });
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PENDING_V2_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Pending;
        setState(parsed);
        if (parsed.journey) setStep(2);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const persist = (next: Pending) => {
    setState(next);
    try {
      localStorage.setItem(PENDING_V2_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const pickJourney = (key: JourneyKey) => {
    persist({ journey: key, subcategories: [] });
    setStep(2);
  };

  const toggleSub = (s: string) => {
    persist({
      ...state,
      subcategories: state.subcategories.includes(s)
        ? state.subcategories.filter((x) => x !== s)
        : [...state.subcategories, s],
    });
  };

  const journey = JOURNEYS.find((j) => j.key === state.journey);

  if (step === 1 || !journey) {
    return (
      <MobileFrame>
        <div className="flex-1 flex flex-col px-6 pt-14 pb-8 overflow-y-auto animate-fade-in">
          <h1 className="font-display font-bold text-3xl text-sage-900 mb-2">
            Choose your journey
          </h1>
          <p className="text-sage-700/60 text-sm mb-8 leading-relaxed">
            What are you working on right now? You can pick more later.
          </p>
          <div className="grid grid-cols-1 gap-3">
            {JOURNEYS.map((j) => (
              <button
                key={j.key}
                onClick={() => pickJourney(j.key)}
                className="p-5 rounded-2xl border border-sage-100 bg-white text-left hover:border-sage-400 transition-all flex items-center gap-4 hover-scale"
              >
                <div className="text-3xl">{j.emoji}</div>
                <div className="flex-1">
                  <div className="font-semibold text-sage-900">{j.name}</div>
                  <div className="text-xs text-sage-600/70 mt-0.5">{j.blurb}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </MobileFrame>
    );
  }

  return (
    <MobileFrame>
      <div className="flex-1 flex flex-col px-6 pt-14 pb-8 overflow-y-auto animate-fade-in">
        <button
          onClick={() => setStep(1)}
          className="self-start -ml-2 p-2 rounded-full hover:bg-sage-50 mb-2 text-sage-700"
          aria-label="Back"
        >
          <ChevronLeft className="size-5" />
        </button>
        <div className="text-3xl mb-2">{journey.emoji}</div>
        <h1 className="font-display font-bold text-3xl text-sage-900 mb-2">
          {journey.name}
        </h1>
        <p className="text-sage-700/60 text-sm mb-6 leading-relaxed">
          Pick the areas closest to you. Pick as many as you'd like.
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          {journey.subcategories.map((s) => {
            const on = state.subcategories.includes(s);
            return (
              <button
                key={s}
                onClick={() => toggleSub(s)}
                className={cn(
                  "px-3 py-3 rounded-xl border text-sm font-medium transition-all",
                  on
                    ? "bg-sage-600 text-white border-sage-600 shadow-md shadow-sage-600/20"
                    : "bg-white border-sage-100 text-sage-900 hover:border-sage-300",
                )}
              >
                {s}
              </button>
            );
          })}
        </div>
        <button
          disabled={state.subcategories.length === 0}
          onClick={() => navigate({ to: "/auth" })}
          className="mt-8 py-3.5 rounded-full bg-sage-900 text-cream font-medium text-sm disabled:opacity-40"
        >
          Continue
        </button>
      </div>
    </MobileFrame>
  );
}
