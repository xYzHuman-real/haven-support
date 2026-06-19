import type { CapacitorConfig } from '@capacitor/cli';

// Native shell ships the SPA bundle from dist/client.
// (Data calls still hit the live Lovable Cloud backend via the native fetch bridge.)
const config: CapacitorConfig = {
  appId: 'com.haven.app',
  appName: 'Haven',
  webDir: 'dist/client',
  server: {
    androidScheme: 'https',
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

