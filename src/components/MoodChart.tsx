import { useMemo } from "react";
import { MOODS } from "@/lib/haven-constants";

const MOOD_SCORE: Record<string, number> = {
  great: 5,
  good: 4,
  peaceful: 4,
  okay: 3,
  struggling: 2,
  exhausted: 1,
};

type Row = { day: string; mood: string };

export function MoodChart({ rows, days }: { rows: Row[]; days: 7 | 30 }) {
  const points = useMemo(() => {
    const map = new Map(rows.map((r) => [r.day, r.mood]));
    const out: Array<{ day: string; mood: string | null; score: number | null; label: string }> = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const mood = map.get(iso) ?? null;
      out.push({
        day: iso,
        mood,
        score: mood ? MOOD_SCORE[mood] ?? null : null,
        label: d.toLocaleDateString(undefined, { weekday: "short", day: "numeric" }),
      });
    }
    return out;
  }, [rows, days]);

  const filled = points.filter((p) => p.score !== null).length;

  if (filled === 0) {
    return (
      <div className="text-center text-sm text-sage-700/60 py-10">
        No mood check-ins yet. Tap a mood on Home to start your history.
      </div>
    );
  }

  const max = 5;
  return (
    <div>
      <div className="flex items-end gap-1 h-32 mb-2">
        {points.map((p) => {
          const h = p.score ? (p.score / max) * 100 : 6;
          const moodEmoji = p.mood ? MOODS.find((m) => m.value === p.mood)?.emoji : null;
          return (
            <div
              key={p.day}
              className="flex-1 flex flex-col items-center justify-end gap-1"
              title={p.day}
            >
              {moodEmoji && days === 7 && (
                <span className="text-[10px]">{moodEmoji}</span>
              )}
              <div
                className={
                  p.score
                    ? "w-full rounded-t-md bg-sage-600/80"
                    : "w-full rounded-t-md bg-sage-100"
                }
                style={{ height: `${h}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] text-sage-600/60">
        <span>{points[0]?.label}</span>
        <span>{points[points.length - 1]?.label}</span>
      </div>
    </div>
  );
}
