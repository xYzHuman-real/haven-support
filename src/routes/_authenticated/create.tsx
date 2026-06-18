import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronLeft } from "lucide-react";
import { MobileFrame } from "@/components/MobileFrame";
import { createPost, getProfile } from "@/lib/feed.functions";
import { COMMUNITIES } from "@/lib/haven-constants";

export const Route = createFileRoute("/_authenticated/create")({
  component: Create,
});

function Field({
  label,
  color,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  color: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <span className={`text-[10px] uppercase font-bold tracking-wider ${color}`}>{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={280}
        placeholder={placeholder}
        rows={3}
        className="mt-1 w-full p-3 rounded-xl bg-white border border-sage-100 text-sm focus:outline-none focus:border-sage-400 resize-none"
      />
      <div className="text-[10px] text-sage-600/40 text-right">{value.length}/280</div>
    </div>
  );
}

function Create() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const submit = useServerFn(createPost);
  const profile = useQuery({ queryKey: ["profile"], queryFn: () => getProfile() });

  const [win, setWin] = useState("");
  const [struggle, setStruggle] = useState("");
  const [goal, setGoal] = useState("");
  const [anon, setAnon] = useState(false);
  const [community, setCommunity] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const userExams = (profile.data?.exams as string[] | undefined) ?? [];
  const availableComms = COMMUNITIES.filter(
    (c) => userExams.length === 0 || userExams.includes(c.slug),
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!win.trim() || !struggle.trim() || !goal.trim()) return;
    setBusy(true);
    try {
      await submit({
        data: {
          win: win.trim(),
          struggle: struggle.trim(),
          goal: goal.trim(),
          is_anonymous: anon,
          community,
        },
      });
      qc.invalidateQueries({ queryKey: ["feed"] });
      qc.invalidateQueries({ queryKey: ["community-counts"] });
      toast.success("Shared with Haven 🌱");
      navigate({ to: "/home" });
    } catch (e: any) {
      toast.error(e?.message ?? "Couldn't share");
    } finally {
      setBusy(false);
    }
  };

  return (
    <MobileFrame>
      <header className="px-6 pt-12 pb-4 flex items-center gap-3 border-b border-sage-100">
        <Link to="/home" className="-ml-2 p-2 rounded-full hover:bg-sage-50">
          <ChevronLeft className="size-5" />
        </Link>
        <h1 className="font-serif italic text-2xl">Today's Trio</h1>
      </header>

      <form onSubmit={onSubmit} className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
        <Field
          label="One Win"
          color="text-emerald-600"
          value={win}
          onChange={setWin}
          placeholder="Something you're proud of today…"
        />
        <Field
          label="One Struggle"
          color="text-amber-600"
          value={struggle}
          onChange={setStruggle}
          placeholder="What's been heavy?"
        />
        <Field
          label="One Goal"
          color="text-blue-600"
          value={goal}
          onChange={setGoal}
          placeholder="What's one small step for tomorrow?"
        />

        {availableComms.length > 0 && (
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-sage-700">
              Post to community (optional)
            </span>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setCommunity(null)}
                className={
                  community === null
                    ? "px-3 py-1.5 rounded-full bg-sage-900 text-cream text-xs"
                    : "px-3 py-1.5 rounded-full bg-white border border-sage-100 text-xs text-sage-700"
                }
              >
                None
              </button>
              {availableComms.map((c) => (
                <button
                  type="button"
                  key={c.slug}
                  onClick={() => setCommunity(c.slug)}
                  className={
                    community === c.slug
                      ? "px-3 py-1.5 rounded-full bg-sage-900 text-cream text-xs"
                      : "px-3 py-1.5 rounded-full bg-white border border-sage-100 text-xs text-sage-700"
                  }
                >
                  {c.icon} {c.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <label className="flex items-center gap-3 p-4 bg-sage-50 rounded-xl cursor-pointer">
          <input
            type="checkbox"
            checked={anon}
            onChange={(e) => setAnon(e.target.checked)}
            className="size-4 accent-sage-600"
          />
          <div>
            <div className="text-sm font-medium">Post anonymously</div>
            <div className="text-[11px] text-sage-600/60">Your name won't be shown.</div>
          </div>
        </label>

        <button
          disabled={busy || !win.trim() || !struggle.trim() || !goal.trim()}
          className="w-full py-3.5 rounded-full bg-sage-900 text-cream font-medium text-sm disabled:opacity-40"
        >
          Share
        </button>
      </form>
    </MobileFrame>
  );
}
