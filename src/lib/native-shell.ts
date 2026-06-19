// Native shell wiring for the Capacitor Android build.
// Safe no-op on web — every call is gated on Capacitor.isNativePlatform().
// Handles: status bar styling, splash screen hide, Android hardware back button.

function isNative(): boolean {
  if (typeof window === "undefined") return false;
  return (window as any).Capacitor?.isNativePlatform?.() === true;
}

let installed = false;

export async function installNativeShell(navigate: (to: string) => void) {
  if (!isNative() || installed) return;
  installed = true;

  // Status bar — match the cream background, dark icons.
  try {
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    await StatusBar.setStyle({ style: Style.Light }); // dark icons on light bg
    await StatusBar.setBackgroundColor({ color: "#F5F1E8" });
    await StatusBar.setOverlaysWebView({ overlay: false });
  } catch {
    /* plugin not present */
  }

  // Splash — hide after first paint.
  try {
    const { SplashScreen } = await import("@capacitor/splash-screen");
    setTimeout(() => SplashScreen.hide().catch(() => {}), 400);
  } catch {
    /* plugin not present */
  }

  // Hardware back button — pop history, or exit when on a root route.
  try {
    const { App } = await import("@capacitor/app");
    App.addListener("backButton", ({ canGoBack }) => {
      const path = window.location.pathname;
      const rootRoutes = ["/", "/check-in", "/home", "/communities", "/profile", "/auth", "/onboarding"];
      if (rootRoutes.includes(path) || !canGoBack) {
        App.exitApp();
      } else {
        window.history.back();
      }
    });
  } catch {
    /* plugin not present */
  }
}
