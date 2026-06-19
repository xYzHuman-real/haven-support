import { useEffect } from "react";
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (error || !data.user) {
        navigate({ to: "/auth", replace: true });
      }
    });
  }, [navigate]);

  return <Outlet />;
}
