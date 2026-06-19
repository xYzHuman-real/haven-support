import { cn } from "@/lib/utils";

type Badge = {
  code: string;
  name: string;
  description: string;
  emoji: string;
  threshold: number;
  unlocked: boolean;
};

export function BadgeGrid({ badges }: { badges: Badge[] }) {
  if (badges.length === 0) return null;
  return (
    <div className="grid grid-cols-2 gap-3">
      {badges.map((b) => (
        <div
          key={b.code}
          className={cn(
            "rounded-2xl p-4 border text-center transition-all",
            b.unlocked
              ? "bg-white border-sage-200 shadow-sm"
              : "bg-sage-50/40 border-sage-100 opacity-60",
          )}
        >
          <div className={cn("text-3xl mb-1", b.unlocked ? "" : "grayscale")}>
            {b.emoji}
          </div>
          <div className="text-sm font-semibold text-sage-900">{b.name}</div>
          <div className="text-[11px] text-sage-700/70 mt-0.5 leading-tight">
            {b.description}
          </div>
        </div>
      ))}
    </div>
  );
}
