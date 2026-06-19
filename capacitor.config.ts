import type { CapacitorConfig } from '@capacitor/cli';

// Native shell loads the live published web app (which is SSR-rendered).
// Override with CAP_SERVER_URL at build time if you ever change the URL.
const DEFAULT_SERVER_URL = 'https://grow-together-haven.lovable.app';
const serverUrl = (process.env.CAP_SERVER_URL?.trim() || DEFAULT_SERVER_URL);

const config: CapacitorConfig = {
  appId: 'com.haven.app',
  appName: 'Haven',
  webDir: 'dist/client',
  server: {
    androidScheme: 'https',
    ...(serverUrl ? { url: serverUrl, cleartext: false } : {}),
  },
  android: {
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#F5F1E8',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
      launchAutoHide: true,
    },
  },
};

export default config;
