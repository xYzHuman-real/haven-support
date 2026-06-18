export const MOODS = [
  { value: "great", emoji: "😊", label: "Great" },
  { value: "good", emoji: "🙂", label: "Good" },
  { value: "okay", emoji: "😐", label: "Okay" },
  { value: "struggling", emoji: "😔", label: "Struggling" },
  { value: "exhausted", emoji: "😴", label: "Exhausted" },
  { value: "peaceful", emoji: "😌", label: "Peaceful" },
] as const;

export type MoodValue = (typeof MOODS)[number]["value"];

export const moodMeta = (v: string | null | undefined) =>
  MOODS.find((m) => m.value === v) ?? null;

export const COMMUNITIES = [
  { slug: "neet", name: "NEET", icon: "🩺", blurb: "Aspiring medical students" },
  { slug: "jee", name: "JEE", icon: "⚙️", blurb: "Engineering aspirants" },
  { slug: "upsc", name: "UPSC", icon: "📖", blurb: "Civil services aspirants" },
  { slug: "banking", name: "Banking", icon: "🏦", blurb: "Bank exam prep" },
  { slug: "ssc", name: "SSC", icon: "📝", blurb: "SSC aspirants" },
  { slug: "college", name: "College Life", icon: "🎓", blurb: "Navigating college" },
] as const;

export type CommunitySlug = (typeof COMMUNITIES)[number]["slug"];

export const ENCOURAGEMENTS = [
  { kind: "understand", label: "I Understand", icon: "🤝" },
  { kind: "keep_going", label: "Keep Going", icon: "💪" },
  { kind: "not_alone", label: "You're Not Alone", icon: "🌱" },
  { kind: "proud", label: "Proud Of You", icon: "❤️" },
] as const;

export type EncouragementKind = (typeof ENCOURAGEMENTS)[number]["kind"];

export const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "S";

export const greeting = (d = new Date()) => {
  const h = d.getHours();
  if (h < 5) return "Resting Well";
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
};
