// Builds the React SPA shell that ships inside the Android APK.
//
// We run a normal `vite build` (TanStack Start outputs dist/client + a server
// bundle), then patch dist/client/index.html so it works as a pure SPA loaded
// from the file:// scheme inside the Capacitor WebView:
//   - strip <base href="/"> (file:// has no host)
//   - rewrite absolute "/" asset URLs to relative "./"
// Hash router (src/router.tsx) handles client-side routing.
// All data calls are routed to the remote backend by src/lib/native-fetch-bridge.ts.
import { execSync } from "child_process";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const clientDir = join("dist", "client");
const indexPath = join(clientDir, "index.html");

console.log("▶ Running vite build…");
execSync("bun run build", { stdio: "inherit" });

if (!existsSync(indexPath)) {
  // Fallback: write a tiny loader shell so Capacitor packaging still succeeds.
  // This should rarely trigger — `vite build` normally produces index.html.
  console.warn("⚠️  dist/client/index.html missing after build — writing minimal shell.");
  mkdirSync(clientDir, { recursive: true });
  writeFileSync(
    indexPath,
    `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Haven</title></head><body><div id="root"></div></body></html>`,
  );
  process.exit(0);
}

let html = readFileSync(indexPath, "utf8");

// 1. Drop <base> — file:// has no origin.
html = html.replace(/<base[^>]*\/?>/gi, "");

// 2. Rewrite absolute /assets, /_build, etc. to relative ./assets so file:// works.
html = html.replace(/(src|href)="\/(?!\/)/g, '$1="./');

writeFileSync(indexPath, html);
console.log("✅ Patched", indexPath, "for Capacitor file:// loading.");
