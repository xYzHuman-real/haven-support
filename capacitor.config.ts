import type { CapacitorConfig } from '@capacitor/cli';

// The Android shell loads the live deployed Lovable app directly.
// This avoids shipping the SPA bundle (TanStack Start's SSR pipeline isn't
// straightforward to repackage as a static SPA shell) and ensures the app
// always runs the latest published code without rebuilding the APK.
//
// `dist/client` still exists from the regular `vite build` and is used as the
// offline fallback bundle Capacitor needs at packaging time, but at runtime
// the WebView navigates to `server.url` below.
const REMOTE_APP_URL = 'https://grow-together-haven.lovable.app';

const config: CapacitorConfig = {
  appId: 'com.haven.app',
  appName: 'Haven',
  webDir: 'dist/client',
  server: {
    url: REMOTE_APP_URL,
    androidScheme: 'https',
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: '#F5F1E8',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
      launchAutoHide: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#F5F1E8',
      overlaysWebView: false,
    },
    FirebaseAuthentication: {
      // Only Google is used; restricting the providers keeps the native SDKs slim.
      skipNativeAuth: false,
      providers: ['google.com'],
    },
  },
};

export default config;
