import { existsSync, renameSync, readFileSync } from "fs";
import { join } from "path";

const clientDir = join("dist", "client");
const built = join(clientDir, "capacitor.index.html");
const target = join(clientDir, "index.html");

if (!existsSync(built)) {
  throw new Error(`Capacitor SPA build output missing: ${built}`);
}

renameSync(built, target);
console.log("✅ Capacitor index.html ready at", target);
console.log(readFileSync(target, "utf8").slice(0, 400));
