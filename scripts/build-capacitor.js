// Capacitor needs SOME webDir bundle at packaging time even when we load a
// remote URL at runtime. Write a minimal placeholder so the Android build
// doesn't trip on a missing dist/client.
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";

const clientDir = join("dist", "client");
const indexPath = join(clientDir, "index.html");

if (!existsSync(clientDir)) {
  mkdirSync(clientDir, { recursive: true });
}

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>Haven</title>
  <style>
    html, body { margin: 0; height: 100%; background: #F5F1E8; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .wrap { height: 100%; display: flex; align-items: center; justify-content: center; color: #4a5d4a; text-align: center; padding: 24px; }
  </style>
</head>
<body>
  <div class="wrap">
    <div>
      <h1 style="font-style: italic; font-weight: 400; margin: 0 0 8px;">Haven</h1>
      <p style="opacity: .7; font-size: 14px;">Loading…</p>
    </div>
  </div>
</body>
</html>
`;

writeFileSync(indexPath, html);
console.log("✅ Wrote Capacitor fallback shell to", indexPath);
console.log("   At runtime, the WebView loads the remote URL from capacitor.config.ts (server.url).");
