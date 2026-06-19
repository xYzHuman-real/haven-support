import type { CapacitorConfig } from '@capacitor/cli';

// Native shell loads the live web app (which is SSR-rendered).
// Set CAP_SERVER_URL at build time to your published/preview URL,
// e.g. https://your-app.lovable.app
const serverUrl = process.env.CAP_SERVER_URL?.trim();

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
