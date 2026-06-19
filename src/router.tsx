import { QueryClient } from "@tanstack/react-query";
import { createRouter, createHashHistory } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

function isNativeOrFile() {
  if (typeof window === "undefined") return false;
  return (
    (window as any).Capacitor?.isNativePlatform?.() ||
    window.location.protocol === "file:"
  );
}

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    ...(isNativeOrFile() ? { history: createHashHistory() } : {}),
  });

  return router;
};
