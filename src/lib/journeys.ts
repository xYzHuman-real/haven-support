export type JourneyKey =
  | "exams"
  | "productivity"
  | "self_improvement"
  | "career"
  | "college";

export type Journey = {
  key: JourneyKey;
  name: string;
  emoji: string;
  blurb: string;
  subcategories: string[];
};

export const JOURNEYS: Journey[] = [
  {
    key: "exams",
    name: "Exams",
    emoji: "📚",
    blurb: "Prep that doesn't feel lonely.",
    subcategories: ["NEET", "JEE", "UPSC", "SSC", "Banking", "GATE", "CAT", "CA"],
  },
  {
    key: "productivity",
    name: "Productivity",
    emoji: "🚀",
    blurb: "Show up for what matters.",
    subcategories: ["Wake Up Early", "Deep Work", "Consistency", "Focus", "Digital Detox"],
  },
  {
    key: "self_improvement",
    name: "Self Improvement",
    emoji: "💪",
    blurb: "Become who you want to be.",
    subcategories: ["Fitness", "Reading", "Meditation", "Confidence"],
  },
  {
    key: "career",
    name: "Career",
    emoji: "💼",
    blurb: "Build your path.",
    subcategories: ["Coding", "Freelancing", "Startups", "Job Preparation"],
  },
  {
    key: "college",
    name: "College Life",
    emoji: "🎓",
    blurb: "You're not alone in this.",
    subcategories: ["Study Life", "Placements", "College Stress"],
  },
];

export const journeyByKey = (k: string | null | undefined) =>
  JOURNEYS.find((j) => j.key === k) ?? null;

export const PENDING_V2_KEY = "haven_pending_v2";
