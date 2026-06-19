## Goal

Make the Android build feel like a real Play Store app:
- Stop loading the website over the network. Ship the UI inside the APK.
- "Continue with Google" opens the native Google account picker, not a browser tab.
- Fix the Save button on the mood check-in screen.

---

## What needs to change

### 1. Bundle the app as a static SPA inside the APK

Today Capacitor opens `grow-together-haven.lovable.app` in a WebView, so the app feels like a website and Google sign-in has to redirect through a browser.

- Remove the remote `server.url` from `capacitor.config.ts`.
- Add a SPA build mode: a new Vite config + entry that renders TanStack Router on the client only, outputting plain `index.html` + `assets/` to `dist/spa`.
- All data calls (Supabase, server functions) keep talking to the live Lovable Cloud backend over HTTPS — only the UI ships locally.
- Point `webDir` to `dist/spa` and update the GitHub Actions workflow to build that target before `cap sync`.
- Result: instant cold start, no white flash, no browser address bar feel.

### 2. Native Google sign-in (no browser redirect)

- Add `@codetrix-studio/capacitor-google-auth`.
- Detect platform with `Capacitor.isNativePlatform()`. On native, call the plugin's `signIn()`, then hand the returned Google `idToken` to `supabase.auth.signInWithIdToken({ provider: 'google', token })`. On web, keep the current `lovable.auth.signInWithOAuth` flow.
- Configure the plugin with a Web Client ID in `capacitor.config.ts`.

**You will need to do this manually (one-time):**
1. In Google Cloud Console → Credentials, create an **OAuth 2.0 Client ID of type "Web application"** (or reuse the one Lovable Cloud uses for Google sign-in). Copy the client ID.
2. Create another OAuth client of type **Android**, give it package name `com.haven.app`, and paste the SHA-1 fingerprint of the keystore the GitHub Action signs with. (If the workflow currently builds a debug APK, the debug keystore SHA-1 works for testing; for Play Store you'll generate a release keystore.)
3. Add the Web Client ID as a build secret called `GOOGLE_WEB_CLIENT_ID` in GitHub repo settings, and as `VITE_GOOGLE_WEB_CLIENT_ID` in Lovable so dev preview works.

I'll wire the code, but I can't generate the SHA-1 or register it in Google Cloud for you.

### 3. Fix the Save button on the check-in screen

The Save button on "How are you feeling today?" calls a protected server function that needs the user's auth token. Two things can make it silently fail right after sign-up:

- The Supabase session isn't fully written to storage before the navigation to `/check-in` fires, so the server function call goes out without a bearer token and returns 401.
- The error handler only shows a toast and unsticks the button, but the toast can be missed.

Fix:
- After `signUp` / `signInWithPassword` and after Google sign-in, await `supabase.auth.getSession()` (and retry briefly if null) before navigating.
- In `check-in.tsx`, surface the real error message in the toast so failures aren't invisible, and re-enable the button on error (already done) — add a small "Sign in again" fallback if a 401 comes back.

### 4. Native polish (so it doesn't look like a webview)

- Status bar plugin: set background to `#F5F1E8` and dark icons to match the cream theme.
- Keep the existing splash screen config; preload the first paint behind the splash so there's no white flash.
- Disable iOS-style overscroll/bounce and text selection on long-press.
- Lock orientation to portrait (matches the MobileFrame design).

---

## Files I'll touch

- `capacitor.config.ts` — drop remote URL, point `webDir: 'dist/spa'`, add GoogleAuth + StatusBar plugin config.
- `vite.spa.config.ts` (new) — SPA build target.
- `src/spa-entry.tsx` (new) — client-only router bootstrap.
- `package.json` — add `build:spa` script, install `@codetrix-studio/capacitor-google-auth`, `@capacitor/status-bar`.
- `src/lib/native-auth.ts` (new) — platform-aware Google sign-in helper.
- `src/routes/auth.tsx` — call the new helper, wait for session before navigating.
- `src/routes/_authenticated/check-in.tsx` — better error surfacing on Save.
- `.github/workflows/android.yml` — run `bun run build:spa` before `cap sync`, inject `GOOGLE_WEB_CLIENT_ID`.

---

## What you'll do after I'm done

1. Add the two GitHub secrets (`GOOGLE_WEB_CLIENT_ID`, and later your release keystore).
2. Register the Android OAuth client in Google Cloud with your APK's SHA-1.
3. Re-run the **Build Android APK** workflow and install the new APK.

Hit approve and I'll build it. Reject if you'd rather try the lighter "keep remote URL, just polish chrome" path instead — that's faster but Google sign-in will still flash a browser tab.