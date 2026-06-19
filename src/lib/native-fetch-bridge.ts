// Capacitor / native bridge for API calls.
// When the app runs inside a Capacitor APK (or any file:// origin),
// rewrite relative fetch URLs to hit a remote backend (the published
// Lovable app), so server functions (createServerFn RPC) still work.
//
// Web (browser preview): no-op — relative URLs already work.

const REMOTE_API_BASE =
  (import.meta.env.VITE_REMOTE_API_BASE as string | undefined) ||
  "https://project--47f00b74-0ab7-433f-a843-5ac5b0f9b92c.lovable.app";

function isNative() {
  if (typeof window === "undefined") return false;
  return (
    (window as any).Capacitor?.isNativePlatform?.() === true ||
    window.location.protocol === "file:" ||
    window.location.protocol === "capacitor:"
  );
}

let installed = false;

export function installNativeFetchBridge() {
  if (installed) return;
  if (typeof window === "undefined") return;
  if (!isNative()) return;
  installed = true;

  const originalFetch = window.fetch.bind(window);

  window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    try {
      let url: string;
      let req: Request | null = null;

      if (typeof input === "string") {
        url = input;
      } else if (input instanceof URL) {
        url = input.toString();
      } else {
        req = input;
        url = input.url;
      }

      // Only rewrite relative or same-origin (file://) URLs.
      // Leave absolute http(s) URLs (e.g. Supabase) untouched.
      if (url.startsWith("/")) {
        const rewritten = REMOTE_API_BASE.replace(/\/$/, "") + url;
        if (req) {
          const newReq = new Request(rewritten, req);
          return originalFetch(newReq, init);
        }
        return originalFetch(rewritten, { credentials: "omit", ...init });
      }

      // file:///... or capacitor://localhost/... requests for the SPA itself
      if (/^(file:|capacitor:|https?:\/\/localhost)/.test(url)) {
        // If it's a same-origin asset (HTML, JS, CSS), let it through.
        // Otherwise, if it's an unknown path that should hit the API, ignore.
        return originalFetch(input as any, init);
      }
    } catch {
      /* fall through to original fetch */
    }
    return originalFetch(input as any, init);
  }) as typeof fetch;
}
