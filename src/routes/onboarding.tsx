import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MobileFrame } from "@/components/MobileFrame";

export const Route = createFileRoute("/onboarding")({
  ssr: false,
  component: Onboarding,
});

const slides = [
  {
    emoji: "🌙",
    title: "Feeling alone in your journey?",
    body: "Exams, work, growth — every journey gets heavy. You don't have to walk it alone.",
  },
  {
    emoji: "🤝",
    title: "Share your journey.",
    body: "Wins, struggles, goals — share them with people walking similar paths.",
  },
  {
    emoji: "🌱",
    title: "Grow together.",
    body: "Find encouragement, accountability, and quiet support every day.",
  },
];

function Onboarding() {
  const [i, setI] = useState(0);
  const navigate = useNavigate();
  const slide = slides[i];
  const last = i === slides.length - 1;
  return (
    <MobileFrame>
      <div className="flex-1 flex flex-col px-8 pt-20 pb-10">
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="text-7xl mb-10">{slide.emoji}</div>
          <h1 className="font-serif italic text-4xl text-sage-900 mb-4 text-balance">
            {slide.title}
          </h1>
          <p className="text-sage-700/70 leading-relaxed text-pretty max-w-[28ch]">{slide.body}</p>
        </div>
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, idx) => (
            <span
              key={idx}
              className={
                idx === i
                  ? "h-1.5 w-8 rounded-full bg-sage-600"
                  : "h-1.5 w-1.5 rounded-full bg-sage-200"
              }
            />
          ))}
        </div>
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => navigate({ to: "/exam-select" })}
            className="text-sm text-sage-600/60"
          >
            Skip
          </button>
          <button
            onClick={() => (last ? navigate({ to: "/exam-select" }) : setI(i + 1))}
            className="px-7 py-3 rounded-full bg-sage-900 text-cream font-medium text-sm"
          >
            {last ? "Get Started" : "Next"}
          </button>
        </div>
      </div>
    </MobileFrame>
  );
}
