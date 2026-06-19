import { readFileSync, readdirSync, writeFileSync } from "fs";
import { join } from "path";

const distDir = "dist";
const clientDir = join(distDir, "client");
const assetsDir = join(clientDir, "assets");

function findAsset(prefix, ext) {
  const files = readdirSync(assetsDir);
  const match = files.find((f) => f.startsWith(prefix + "-") && f.endsWith(ext));
  if (!match) throw new Error(`Asset not found: ${prefix}*.${ext}`);
  return `./assets/${match}`;
}

const jsEntry = findAsset("index", ".js");
const cssEntry = findAsset("styles", ".css");

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
  <meta name="theme-color" content="#fdfdfb" />
  <title>Haven — You are not alone</title>
  <meta name="description" content="A safe place for students to share wins, struggles, and goals — and grow together." />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&display=swap" />
  <link rel="stylesheet" href="${cssEntry}" />
</head>
<body>
  <div id="app"></div>
  <script type="module" src="${jsEntry}"></script>
</body>
</html>
`;

writeFileSync(join(clientDir, "index.html"), html);
console.log("✅ Capacitor index.html generated at dist/client/index.html");
console.log("   JS:", jsEntry);
console.log("   CSS:", cssEntry);

