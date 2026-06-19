// SPA build for the Capacitor Android shell.
// Uses TanStack Start's built-in SPA mode (prerenders a single shell HTML
// that the client bundle hydrates and routes from). Output goes to dist/client.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    spa: {
      enabled: true,
      maskPath: "/",
    },
  },
});
