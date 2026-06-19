// Platform-aware Google sign-in.
// On native (Capacitor + Android): uses Firebase Authentication's native Google
// sign-in (Credential Manager / Google Identity Services SDK) to get a Google
// ID token without opening a browser, then exchanges it with Supabase for a
// session. Firebase is only used as the token broker — Supabase remains the
// auth/session source of truth.
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
      const { FirebaseAuthentication } = await import(
        "@capacitor-firebase/authentication"
      );
      const result = await FirebaseAuthentication.signInWithGoogle();
      const idToken = result?.credential?.idToken;
      if (!idToken) return { ok: false, error: "Google didn't return an ID token" };
      const { error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: idToken,
      });
      if (error) return { ok: false, error: error.message };
      // Sign out of Firebase — we only used it to broker the Google token.
      try { await FirebaseAuthentication.signOut(); } catch { /* ignore */ }
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
