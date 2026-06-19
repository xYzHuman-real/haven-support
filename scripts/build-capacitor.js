// Post-process the SPA build for Capacitor.
// TanStack Start SPA mode prerenders an HTML shell into dist/client. We
// just need to make sure dist/client/index.html exists at that path.
import { existsSync, readdirSync, readFileSync, copyFileSync } from "fs";
import { join } from "path";

const clientDir = join("dist", "client");

if (!existsSync(clientDir)) {
  throw new Error(`Missing ${clientDir} — did the SPA build run?`);
}

const candidates = [
  join(clientDir, "index.html"),
  join(clientDir, "_shell.html"),
  join(clientDir, "200.html"),
];

let resolved = candidates.find((p) => existsSync(p));
if (!resolved) {
  // Fall back: find first .html in dist/client root
  const root = readdirSync(clientDir).filter((f) => f.endsWith(".html"));
  if (root[0]) resolved = join(clientDir, root[0]);
}

if (!resolved) {
  throw new Error(
    `No prerendered HTML found in ${clientDir}. Files: ${readdirSync(clientDir).join(", ")}`,
  );
}

const target = join(clientDir, "index.html");
if (resolved !== target) {
  copyFileSync(resolved, target);
}

console.log("✅ Capacitor SPA shell ready at", target);
console.log(readFileSync(target, "utf8").slice(0, 400));
