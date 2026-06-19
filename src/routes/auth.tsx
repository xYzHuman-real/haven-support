import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { signInWithGoogle, waitForSession } from "@/lib/native-auth";
import { MobileFrame } from "@/components/MobileFrame";

export const Route = createFileRoute("/auth")({
  ssr: false,
  component: AuthPage,
});

const LEGACY_EXAMS_KEY = "haven_pending_exams";
const PENDING_V2_KEY = "haven_pending_v2";

async function applyPendingExams() {
  try {
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;
    if (!user) return;
    const update: Record<string, unknown> = { onboarded: true };
    const v2raw = localStorage.getItem(PENDING_V2_KEY);
    if (v2raw) {
      const v2 = JSON.parse(v2raw) as { journey?: string | null; subcategories?: string[] };
      if (v2.journey) update.journey = v2.journey;
      if (Array.isArray(v2.subcategories)) {
        update.subcategories = v2.subcategories;
        update.exams = v2.subcategories; // back-compat
      }
    } else {
      const legacy = localStorage.getItem(LEGACY_EXAMS_KEY);
      if (legacy) {
        const exams = JSON.parse(legacy) as string[];
        update.exams = exams;
        update.subcategories = exams;
      }
    }
    await supabase.from("profiles").update(update).eq("id", user.id);
    localStorage.removeItem(PENDING_V2_KEY);
    localStorage.removeItem(LEGACY_EXAMS_KEY);
  } catch {
    /* ignore */
  }
}

function isNativeApp() {
  if (typeof window === "undefined") return false;
  return (window as any).Capacitor?.isNativePlatform?.() === true;
}

function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [checkingSession, setCheckingSession] = useState(true);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  // Google sign-in uses native Credential Manager on Android (no browser tab)
  // and Lovable OAuth on web. Always available.
  const hideGoogle = false;

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      if (data.session?.user) {
        applyPendingExams().then(() => navigate({ to: "/check-in", replace: true }));
      } else {
        setCheckingSession(false);
      }
    }).catch(() => {
      if (!cancelled) setCheckingSession(false);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: name || email.split("@")[0] },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      await waitForSession();
      await applyPendingExams();
      navigate({ to: "/check-in" });
    } catch (e: any) {
      toast.error(e?.message ?? "Couldn't sign in");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    const result = await signInWithGoogle(window.location.origin + "/auth");
    if (!result.ok) {
      toast.error(result.error);
      setBusy(false);
      return;
    }
    if (result.redirected) return;
    await waitForSession();
    await applyPendingExams();
    navigate({ to: "/check-in" });
    setBusy(false);
  };

  if (checkingSession) {
    return (
      <MobileFrame>
        <div className="flex-1 flex items-center justify-center text-sage-700/60 text-sm">
          Opening Haven…
        </div>
      </MobileFrame>
    );
  }

  return (
    <MobileFrame>
      <div className="flex-1 flex flex-col px-7 pt-16 pb-10">
        <div className="mb-10 text-center">
          <div className="text-4xl mb-4">🌱</div>
          <h1 className="font-serif italic text-3xl text-sage-900">
            {mode === "signup" ? "Welcome to Haven" : "Welcome back"}
          </h1>
          <p className="text-sage-700/60 text-sm mt-2">
            {mode === "signup" ? "Create your quiet space." : "Sign in to continue."}
          </p>
        </div>

        {!hideGoogle && (
          <>
            <button
              onClick={google}
              disabled={busy}
              className="w-full py-3 rounded-xl bg-white border border-sage-200 text-sm font-medium text-sage-900 mb-3 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              Continue with Google
            </button>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-sage-100" />
              <span className="text-[11px] text-sage-600/50 uppercase tracking-wider">or email</span>
              <div className="flex-1 h-px bg-sage-100" />
            </div>
          </>
        )}

        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" && (
            <input
              required
              maxLength={40}
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white border border-sage-100 text-sm focus:outline-none focus:border-sage-400"
            />
          )}
          <input
            required
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white border border-sage-100 text-sm focus:outline-none focus:border-sage-400"
          />
          <input
            required
            type="password"
            minLength={6}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white border border-sage-100 text-sm focus:outline-none focus:border-sage-400"
          />
          <button
            disabled={busy}
            type="submit"
            className="w-full py-3 rounded-xl bg-sage-900 text-cream text-sm font-medium disabled:opacity-50"
          >
            {mode === "signup" ? "Create account" : "Sign in"}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
          className="text-xs text-sage-600/70 mt-6 self-center"
        >
          {mode === "signup" ? "Already here? Sign in" : "New to Haven? Create an account"}
        </button>
      </div>
    </MobileFrame>
  );
}
