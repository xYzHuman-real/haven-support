import type { CapacitorConfig } from '@capacitor/cli';

// The Android shell ships the React SPA bundled inside the APK (dist/client),
// so screens load instantly from the device and the app works without an
// internet round-trip for UI. Only data calls (Supabase, server functions)
// hit the network — those are routed to the published Lovable backend by
// src/lib/native-fetch-bridge.ts.
const config: CapacitorConfig = {
  appId: 'com.haven.app',
  appName: 'Haven',
  webDir: 'dist/client',
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
      skipNativeAuth: false,
      providers: ['google.com'],
    },
  },
};

export default config;
