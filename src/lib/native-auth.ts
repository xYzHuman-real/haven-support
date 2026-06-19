// Platform-aware Google sign-in.
// On native (Capacitor): uses the native Google account picker, then exchanges
// the returned idToken with Supabase for a session — no browser redirect.
// On web: falls back to the Lovable-managed OAuth redirect flow.
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

function isNative() {
  if (typeof window === "undefined") return false;
  return (window as any).Capacitor?.isNativePlatform?.() === true;
}

export type GoogleSignInResult =
  | { ok: true; redirected: boolean }
  | { ok: false; error: string };

export async function signInWithGoogle(redirectUri: string): Promise<GoogleSignInResult> {
  if (isNative()) {
    try {
      const { GoogleAuth } = await import("@codetrix-studio/capacitor-google-auth");
      // Initialize is required on web platforms; on Android it's a no-op but safe.
      try {
        await GoogleAuth.initialize();
      } catch {
        /* ignore */
      }
      const user = await GoogleAuth.signIn();
      const idToken = (user as any)?.authentication?.idToken;
      if (!idToken) return { ok: false, error: "Google didn't return an ID token" };
      const { error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: idToken,
      });
      if (error) return { ok: false, error: error.message };
      return { ok: true, redirected: false };
    } catch (e: any) {
      return { ok: false, error: e?.message ?? "Google sign-in failed" };
    }
  }

  // Web fallback — uses Lovable-managed OAuth (in-app browser tab on mobile web).
  const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: redirectUri });
  if (result.error) return { ok: false, error: "Google sign-in failed" };
  return { ok: true, redirected: !!result.redirected };
}

// Wait briefly for Supabase to persist the session after auth, so the very next
// authenticated server-function call has a bearer token attached.
export async function waitForSession(maxMs = 2000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    const { data } = await supabase.auth.getSession();
    if (data.session?.access_token) return true;
    await new Promise((r) => setTimeout(r, 100));
  }
  return false;
}
