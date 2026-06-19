# Haven 🌱

> Growing through the journey, together.

A safe place for students to share struggles, celebrate wins, and realize they are not alone.

Built with TanStack Start, React 19, Tailwind v4, and Lovable Cloud (Supabase).

---

## Run the web app

```bash
bun install
bun run dev
```

---

## Build an Android APK with Capacitor

Capacitor is already installed and configured (`capacitor.config.ts`):

- **App name:** Haven
- **Package / App ID:** `com.haven.app`
- **Web build directory:** `dist`

The `android/` native project is **not** committed to this repo — it is generated locally. Follow the steps below on your own machine (Lovable's sandbox cannot run the Android SDK).

### Prerequisites

- Node 20+ and `bun` (or npm)
- **Android Studio** (latest stable) with:
  - Android SDK Platform 34 (or newer)
  - Android SDK Build-Tools
  - An Android emulator or a physical device with USB debugging enabled
- **JDK 17** (bundled with recent Android Studio)

### One-time setup

```bash
# 1. Clone your repo and install deps
git clone <your-repo-url> haven
cd haven
bun install

# 2. Build the web bundle (outputs to dist/)
bun run build

# 3. Add the Android platform (creates the android/ folder)
npx cap add android

# 4. Copy the web build into the native project
npx cap sync android
```

### Generate the APK

**Option A — Android Studio (recommended):**

```bash
npx cap open android
```

Then in Android Studio:

1. Wait for Gradle sync to finish.
2. `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`.
3. Click the **locate** link in the notification to find `app-debug.apk` under `android/app/build/outputs/apk/debug/`.

**Option B — Command line (debug APK):**

```bash
cd android
./gradlew assembleDebug
# APK: android/app/build/outputs/apk/debug/app-debug.apk
```

**Release APK (signed):**

```bash
cd android
./gradlew assembleRelease
```

You'll need a keystore — see [Capacitor's signing guide](https://capacitorjs.com/docs/android/deploying-to-google-play#signing-an-apk).

### Updating after web changes

Every time you change the web app:

```bash
bun run build
npx cap sync android
```

### App icon & splash screen

The default Capacitor icon and a splash with background `#F5F1E8` (Haven cream) are configured. To replace with custom artwork:

1. Install the asset generator: `bun add -D @capacitor/assets`
2. Drop a 1024×1024 `icon.png` and a 2732×2732 `splash.png` into a top-level `assets/` folder.
3. Run: `npx @capacitor/assets generate --android`
4. Re-run `npx cap sync android`.

---

## Tech stack

- TanStack Start v1 (SSR + file-based routing)
- React 19, Tailwind CSS v4
- Lovable Cloud (Postgres, Auth, RLS)
- Capacitor 8 (Android wrapper)
